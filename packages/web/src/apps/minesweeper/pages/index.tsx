import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowActions, useWindowNav } from "@/system";
import type { Difficulty, MinesweeperState } from "../minesweeper-engine";
import {
  chordReveal,
  createInitialState,
  loadBestTimes,
  revealCell,
  saveBestTime,
  toggleFlag,
} from "../minesweeper-engine";
import MinesweeperBoard from "./MinesweeperBoard";
import MinesweeperHeader from "./MinesweeperHeader";
import MinesweeperToolbar from "./MinesweeperToolbar";

const WINDOW_SIZES: Record<Difficulty, { width: number; height: number }> = {
  beginner: { width: 380, height: 520 },
  intermediate: { width: 580, height: 680 },
  expert: { width: 960, height: 680 },
};

export default function MinesweeperPage() {
  const { windowId } = useWindowNav();
  const { updateBounds } = useWindowActions();
  const [state, setState] = useState<MinesweeperState>(() =>
    createInitialState("beginner"),
  );
  const [bestTimes, setBestTimes] = useState(loadBestTimes);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (state.status === "playing" && state.startTime) {
      timerRef.current = setInterval(() => {
        setState((s) => ({
          ...s,
          elapsed: Math.floor(
            (Date.now() - (s.startTime ?? Date.now())) / 1000,
          ),
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.startTime]);

  // Save best time on win
  useEffect(() => {
    if (state.status === "won") {
      saveBestTime(state.difficulty, state.elapsed);
      setBestTimes(loadBestTimes());
    }
  }, [state.status, state.difficulty, state.elapsed]);

  const handleReveal = useCallback((row: number, col: number) => {
    setState((s) => revealCell(s, row, col));
  }, []);

  const handleFlag = useCallback((row: number, col: number) => {
    setState((s) => toggleFlag(s, row, col));
  }, []);

  const handleChord = useCallback((row: number, col: number) => {
    setState((s) => chordReveal(s, row, col));
  }, []);

  const handleNewGame = useCallback(() => {
    setState((s) => createInitialState(s.difficulty));
  }, []);

  const handleDifficulty = useCallback(
    (d: Difficulty) => {
      setState(createInitialState(d));
      updateBounds(windowId, WINDOW_SIZES[d]);
    },
    [windowId, updateBounds],
  );

  const minesLeft = state.mines - state.flagCount;

  return (
    <div className="flex h-full flex-col select-none">
      <MinesweeperToolbar
        difficulty={state.difficulty}
        onDifficulty={handleDifficulty}
        onNewGame={handleNewGame}
        bestTimes={bestTimes}
      />
      <MinesweeperHeader
        minesLeft={minesLeft}
        elapsed={state.elapsed}
        status={state.status}
        onNewGame={handleNewGame}
      />
      <MinesweeperBoard
        board={state.board}
        status={state.status}
        onReveal={handleReveal}
        onFlag={handleFlag}
        onChord={handleChord}
      />
    </div>
  );
}
