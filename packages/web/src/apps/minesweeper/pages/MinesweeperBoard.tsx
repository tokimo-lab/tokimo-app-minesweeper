import { useCallback, useMemo, useRef } from "react";
import type { CellData, GameStatus } from "../minesweeper-engine";
import MinesweeperCell from "./MinesweeperCell";

interface MinesweeperBoardProps {
  board: CellData[][];
  status: GameStatus;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
}

/** Track which mouse buttons are held for left+right chord detection */
interface MouseState {
  buttons: number; // bitmask: 1=left, 2=right
  row: number;
  col: number;
}

export default function MinesweeperBoard({
  board,
  status,
  onReveal,
  onFlag,
  onChord,
}: MinesweeperBoardProps) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  const cellSize = useMemo(() => {
    if (cols <= 9) return 34;
    if (cols <= 16) return 28;
    return 24;
  }, [cols]);

  const mouseRef = useRef<MouseState>({ buttons: 0, row: -1, col: -1 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      const ms = mouseRef.current;
      if (e.button === 0) ms.buttons |= 1;
      if (e.button === 2) ms.buttons |= 2;
      ms.row = row;
      ms.col = col;

      // Right-click alone → flag
      if (e.button === 2 && !(ms.buttons & 1)) {
        e.preventDefault();
        onFlag(row, col);
      }
    },
    [onFlag],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      const ms = mouseRef.current;
      const hadBoth = (ms.buttons & 3) === 3;

      if (e.button === 0) ms.buttons &= ~1;
      if (e.button === 2) ms.buttons &= ~2;

      // Both buttons were held → chord
      if (hadBoth) {
        onChord(row, col);
      } else if (e.button === 0 && !hadBoth) {
        // Single left click release → reveal
        onReveal(row, col);
      }

      ms.buttons = 0;
    },
    [onReveal, onChord],
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.buttons = 0;
  }, []);

  const cells = useMemo(() => {
    const result: { id: string; cell: CellData; row: number; col: number }[] =
      [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({ id: `${r}-${c}`, cell: board[r][c], row: r, col: c });
      }
    }
    return result;
  }, [board, rows, cols]);

  return (
    <div className="flex flex-1 items-center justify-center p-3">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: game board grid */}
      <div
        className="inline-grid rounded-lg bg-black/[0.03] p-[3px] dark:bg-white/[0.03]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gap: "1px",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {cells.map((item) => (
          <MinesweeperCell
            key={item.id}
            cell={item.cell}
            status={status}
            pressed={false}
            size={cellSize}
            onMouseDown={(e) => handleMouseDown(e, item.row, item.col)}
            onMouseUp={(e) => handleMouseUp(e, item.row, item.col)}
            onMouseLeave={handleMouseLeave}
            onContextMenu={(e) => e.preventDefault()}
          />
        ))}
      </div>
    </div>
  );
}
