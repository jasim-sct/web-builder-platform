#!/usr/bin/env bash

# Organization Alert & Reminder System - Backend Runner
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "=================================================="
echo "🚀 Starting Organization Alert Backend (Node.js)"
echo "=================================================="

cd "$DIR/backend"
pnpm run dev
