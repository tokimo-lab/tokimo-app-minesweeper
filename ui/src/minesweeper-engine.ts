// ── Types ──

export type Difficulty = "beginner" | "intermediate" | "expert";

export interface CellData {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
}

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface MinesweeperState {
  rows: number;
  cols: number;
  mines: number;
  board: CellData[][];
  status: GameStatus;
  flagCount: number;
  startTime: number | null;
  elapsed: number;
  difficulty: Difficulty;
}

export interface BestTimes {
  beginner: number | null;
  intermediate: number | null;
  expert: number | null;
}

// ── Difficulty presets ──

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { rows: number; cols: number; mines: number }
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

// ── LocalStorage persistence ──

const LS_KEY = "tokimo:minesweeper:best-times";

export function loadBestTimes(): BestTimes {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        return {
          beginner: typeof obj.beginner === "number" ? obj.beginner : null,
          intermediate:
            typeof obj.intermediate === "number" ? obj.intermediate : null,
          expert: typeof obj.expert === "number" ? obj.expert : null,
        };
      }
    }
  } catch {
    // Corrupt data, ignore
  }
  return { beginner: null, intermediate: null, expert: null };
}

export function saveBestTime(difficulty: Difficulty, time: number): void {
  const current = loadBestTimes();
  const prev = current[difficulty];
  if (prev === null || time < prev) {
    current[difficulty] = time;
    localStorage.setItem(LS_KEY, JSON.stringify(current));
  }
}

// ── Board creation ──

function createEmptyBoard(rows: number, cols: number): CellData[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0,
    })),
  );
}

function placeMines(
  board: CellData[][],
  mines: number,
  safeRow: number,
  safeCol: number,
): void {
  const rows = board.length;
  const cols = board[0].length;
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].mine) continue;
    // Keep a 3×3 safe zone around first click
    if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
    board[r][c].mine = true;
    placed++;
  }
}

function computeAdjacentMines(board: CellData[][]): void {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].mine
          ) {
            count++;
          }
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
}

// ── State creation ──

export function createInitialState(difficulty: Difficulty): MinesweeperState {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
  return {
    rows,
    cols,
    mines,
    board: createEmptyBoard(rows, cols),
    status: "idle",
    flagCount: 0,
    startTime: null,
    elapsed: 0,
    difficulty,
  };
}

// ── Deep clone board ──

function cloneBoard(board: CellData[][]): CellData[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

// ── Flood‑fill reveal ──

function floodReveal(board: CellData[][], r: number, c: number): void {
  const rows = board.length;
  const cols = board[0].length;
  const stack: [number, number][] = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = board[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([cr + dr, cc + dc]);
        }
      }
    }
  }
}

function checkWin(board: CellData[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

// ── Actions ──

export function revealCell(
  state: MinesweeperState,
  row: number,
  col: number,
): MinesweeperState {
  if (state.status === "won" || state.status === "lost") return state;
  const board = cloneBoard(state.board);
  const cell = board[row][col];
  if (cell.revealed || cell.flagged) return state;

  // First click: generate mines avoiding this cell
  if (state.status === "idle") {
    placeMines(board, state.mines, row, col);
    computeAdjacentMines(board);
    floodReveal(board, row, col);
    const won = checkWin(board);
    return {
      ...state,
      board,
      status: won ? "won" : "playing",
      startTime: Date.now(),
    };
  }

  // Hit a mine
  if (cell.mine) {
    cell.revealed = true;
    // Reveal all mines
    for (const r of board) {
      for (const c of r) {
        if (c.mine) c.revealed = true;
      }
    }
    return { ...state, board, status: "lost" };
  }

  // Normal reveal
  floodReveal(board, row, col);
  const won = checkWin(board);
  return {
    ...state,
    board,
    status: won ? "won" : "playing",
  };
}

export function toggleFlag(
  state: MinesweeperState,
  row: number,
  col: number,
): MinesweeperState {
  if (
    state.status === "won" ||
    state.status === "lost" ||
    state.status === "idle"
  )
    return state;
  const board = cloneBoard(state.board);
  const cell = board[row][col];
  if (cell.revealed) return state;
  cell.flagged = !cell.flagged;
  return {
    ...state,
    board,
    flagCount: state.flagCount + (cell.flagged ? 1 : -1),
  };
}

export function chordReveal(
  state: MinesweeperState,
  row: number,
  col: number,
): MinesweeperState {
  if (state.status !== "playing") return state;
  const cell = state.board[row][col];
  if (!cell.revealed || cell.adjacentMines === 0) return state;

  // Count adjacent flags
  let flagCount = 0;
  const rows = state.rows;
  const cols = state.cols;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        state.board[nr][nc].flagged
      ) {
        flagCount++;
      }
    }
  }

  if (flagCount !== cell.adjacentMines) return state;

  const board = cloneBoard(state.board);
  let hitMine = false;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = board[nr][nc];
        if (!neighbor.revealed && !neighbor.flagged) {
          if (neighbor.mine) {
            hitMine = true;
            neighbor.revealed = true;
          } else {
            floodReveal(board, nr, nc);
          }
        }
      }
    }
  }

  if (hitMine) {
    for (const r of board) {
      for (const c of r) {
        if (c.mine) c.revealed = true;
      }
    }
    return { ...state, board, status: "lost" };
  }

  const won = checkWin(board);
  return { ...state, board, status: won ? "won" : "playing" };
}
