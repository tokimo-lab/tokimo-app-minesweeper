import { Bomb, Clock, Frown, SmilePlus, Trophy } from "lucide-react";
import type { GameStatus } from "../minesweeper-engine";

interface MinesweeperHeaderProps {
  minesLeft: number;
  elapsed: number;
  status: GameStatus;
  onNewGame: () => void;
}

function formatElapsed(seconds: number): string {
  return String(Math.min(seconds, 999)).padStart(3, "0");
}

function StatusFace({
  status,
  onNewGame,
}: {
  status: GameStatus;
  onNewGame: () => void;
}) {
  const icon =
    status === "won" ? (
      <Trophy className="size-4 text-yellow-500" />
    ) : status === "lost" ? (
      <Frown className="size-4 text-red-500" />
    ) : (
      <SmilePlus className="size-4 text-black/60 dark:text-white/60" />
    );

  return (
    <button
      type="button"
      onClick={onNewGame}
      title="New Game"
      className="flex size-7 items-center justify-center rounded-md bg-black/5 transition-colors hover:bg-black/10 active:bg-black/15 dark:bg-white/5 dark:hover:bg-white/10"
    >
      {icon}
    </button>
  );
}

export default function MinesweeperHeader({
  minesLeft,
  elapsed,
  status,
  onNewGame,
}: MinesweeperHeaderProps) {
  return (
    <div className="mx-3 mt-2 mb-1 flex items-center justify-between px-3 py-1.5">
      {/* Mine counter */}
      <div className="flex items-center gap-1.5 rounded-md bg-black/5 px-2.5 py-1 dark:bg-white/5">
        <Bomb className="size-3.5 text-red-500/80" />
        <span className="font-mono text-sm font-semibold tabular-nums text-black/70 dark:text-white/70">
          {String(Math.max(minesLeft, 0)).padStart(3, "0")}
        </span>
      </div>

      {/* Face / New Game button */}
      <StatusFace status={status} onNewGame={onNewGame} />

      {/* Timer */}
      <div className="flex items-center gap-1.5 rounded-md bg-black/5 px-2.5 py-1 dark:bg-white/5">
        <Clock className="size-3.5 text-blue-500/80" />
        <span className="font-mono text-sm font-semibold tabular-nums text-black/70 dark:text-white/70">
          {formatElapsed(elapsed)}
        </span>
      </div>
    </div>
  );
}
