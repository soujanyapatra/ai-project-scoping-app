#!/bin/bash
# build.sh — Automatically load nvm, switch to compatibility Node.js, and compile the assets.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Try loading NVM from home directory
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
  # Try to use node 22 or fallback to node 20
  nvm use 22 &>/dev/null || nvm use 20 &>/dev/null
fi

echo "Active Node version: $(node -v)"
echo "Compiling frontend assets with Vite..."
npm run build
