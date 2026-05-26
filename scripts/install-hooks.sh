#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

if command -v lefthook >/dev/null 2>&1; then
  LEFTHOOK="$(command -v lefthook)"
elif [ -x "../../node_modules/.bin/lefthook" ]; then
  LEFTHOOK="$(cd ../.. && pwd)/node_modules/.bin/lefthook"
else
  echo "✗ 找不到 lefthook" >&2
  exit 1
fi

"$LEFTHOOK" install
echo "✓ pre-commit fmt hook installed"
