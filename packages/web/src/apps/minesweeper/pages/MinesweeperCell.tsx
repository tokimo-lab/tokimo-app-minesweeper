import { Flag } from "lucide-react";
import type { CellData, GameStatus } from "../minesweeper-engine";

const NUMBER_COLORS: Record<number, string> = {
  1: "text-[#0000ff] dark:text-blue-400",
  2: "text-[#008000] dark:text-green-400",
  3: "text-[#ff0000] dark:text-red-400",
  4: "text-[#000080] dark:text-purple-400",
  5: "text-[#800000] dark:text-amber-400",
  6: "text-[#008080] dark:text-teal-400",
  7: "text-[#000] dark:text-white",
  8: "text-[#808080] dark:text-gray-400",
};

interface MinesweeperCellProps {
  cell: CellData;
  status: GameStatus;
  pressed: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  size: number;
}

export default function MinesweeperCell({
  cell,
  status,
  pressed,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onContextMenu,
  size,
}: MinesweeperCellProps) {
  const isGameOver = status === "won" || status === "lost";
  const fontSize =
    size <= 24 ? "text-[11px]" : size <= 28 ? "text-xs" : "text-sm";

  if (cell.revealed) {
    if (cell.mine) {
      return (
        // biome-ignore lint/a11y/noStaticElementInteractions: chord mouse tracking
        <div
          className={`flex items-center justify-center ${
            status === "lost" ? "bg-red-400/25 dark:bg-red-500/20" : ""
          }`}
          style={{ width: size, height: size }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <span className={fontSize}>💣</span>
        </div>
      );
    }

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: chord mouse tracking
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {cell.adjacentMines > 0 && (
          <span
            className={`font-semibold leading-none ${fontSize} ${NUMBER_COLORS[cell.adjacentMines]}`}
          >
            {cell.adjacentMines}
          </span>
        )}
      </div>
    );
  }

  // Unrevealed cell — pressed state shows as flat (like chording preview)
  const showPressed = pressed && !isGameOver && !cell.flagged;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: game cell interaction
    <div
      className={`flex items-center justify-center transition-colors duration-75 ${
        isGameOver
          ? "bg-black/[0.06] dark:bg-white/[0.06]"
          : showPressed
            ? "bg-transparent"
            : "bg-black/[0.09] hover:bg-black/[0.13] dark:bg-white/[0.09] dark:hover:bg-white/[0.13]"
      }`}
      style={{ width: size, height: size }}
      onMouseDown={isGameOver ? undefined : onMouseDown}
      onMouseUp={isGameOver ? undefined : onMouseUp}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
    >
      {cell.flagged && <Flag className="size-3 fill-red-500 text-red-500" />}
    </div>
  );
}
