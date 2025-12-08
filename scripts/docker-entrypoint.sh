#!/bin/sh
set -e

RUNTIME_SCRIPT="/app/scripts/write-runtime-env.js"

if [ -f "$RUNTIME_SCRIPT" ]; then
    node "$RUNTIME_SCRIPT"
else
    echo "Runtime generator not found at $RUNTIME_SCRIPT" >&2
fi

exec npx serve -s /app/dist/ -l "${PORT:-8081}"
