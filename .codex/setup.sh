#!/usr/bin/env bash
# .codex/setup.sh – runs at the start of every Codex task
set -euo pipefail

echo "[setup] Installing dependencies via npm ci"
npm ci

if [ -f package.json ]; then
  echo "[setup] Running lint (if present)"
  npm run lint --if-present

  echo "[setup] Running tests (if present)"
  npm test --if-present
fi

# Build Tailwind CSS ahead of tasks that might rely on it
if grep -q "build:css" package.json 2>/dev/null; then
  echo "[setup] Building Tailwind CSS"
  npm run build:css
fi

echo "[setup] Environment ready." 