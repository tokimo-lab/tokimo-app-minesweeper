import type { BestTimes, Difficulty } from "../minesweeper-engine";

const LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "expert"];

interface MinesweeperToolbarProps {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  onNewGame: () => void;
  bestTimes: BestTimes;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function MinesweeperToolbar({
  difficulty,
  onDifficulty,
  onNewGame,
  bestTimes,
}: MinesweeperToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-black/8 px-3 py-1.5 dark:border-white/8">
      {/* Difficulty tabs */}
      <div className="flex items-center gap-0.5 rounded-md bg-black/5 p-0.5 dark:bg-white/5">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDifficulty(d)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              difficulty === d
                ? "bg-surface-raised text-black shadow-sm  dark:text-white"
                : "text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
            }`}
          >
            {LABELS[d]}
          </button>
        ))}
      </div>

      {/* Best time for current difficulty */}
      <span className="ml-auto text-[11px] text-black/40 dark:text-white/40">
        Best: {formatTime(bestTimes[difficulty])}
      </span>

      {/* New Game button */}
      <button
        type="button"
        onClick={onNewGame}
        className="ml-2 rounded-md bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60 transition-colors hover:bg-black/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
      >
        New
      </button>
    </div>
  );
}
