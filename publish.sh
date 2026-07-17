#!/usr/bin/env bash
# Rebuild the Next.js site and (re)start the production server on port 3000.
# Build runs in the foreground so errors surface; the server is launched in a new
# session (setsid) so it keeps running after this script — and your shell — exits.
# Takes over port 3000 (across user boundaries, retrying on races).
set -euo pipefail
cd "$(dirname "$0")"

# Group-writable so any team member can publish over another member's build.
umask 002
mkdir -p .run

# Install deps and build the Next.js app
bun install
bun run build

# Free port 3000 regardless of which user owns the current listener
free_port() {
  for _ in $(seq 1 25); do
    pids=$(lsof -t -iTCP:3000 -sTCP:LISTEN 2>/dev/null || true)
    if [ -z "$pids" ]; then return 0; fi
    kill $pids 2>/dev/null || true
    sleep 0.2
  done
}
sudo sh -c "$(declare -f free_port); free_port"

# Start the Next.js production server
setsid nohup bun run start > .run/server.log 2>&1 < /dev/null &

# Wait for the new server to actually answer before reporting success
for _ in $(seq 1 50); do
  if curl -sf -o /dev/null http://localhost:3000; then
    echo "site published; serving on port 3000"
    exit 0
  fi
  sleep 0.2
done
echo "warning: published, but the server isn't responding — check .run/server.log" >&2
exit 1
