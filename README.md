# tokimo-app-minesweeper

Tokimo Minesweeper — pure-frontend game app in the multi-process app architecture.

## Features

- Beginner / Intermediate / Expert difficulty modes
- Timer and best-time tracking (localStorage)
- Chord reveal (left+right click)
- Dark mode support

## Development

```bash
# Build UI
pnpm -C ui install
pnpm -C ui build --watch

# Build Rust binary (assets embedded at compile time)
cargo build -p tokimo-app-minesweeper
```

## Architecture

No backend, no database. The Rust binary solely serves static assets via UDS,
registered with the Tokimo broker so the shell can proxy `/api/apps/minesweeper/assets/*`.

## License

MIT OR Apache-2.0.
