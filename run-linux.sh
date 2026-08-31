#!/usr/bin/env bash

# Organization Alert & Reminder System - Linux Desktop Runner
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "=================================================="
echo "🚀 Starting Organization Alert App (Linux Desktop)"
echo "=================================================="

# Set up Flutter PATH
export PATH="$PATH:/home/sct/flutter/bin"

# Navigate to application directory
cd "$DIR/application"

# Stale CMake caches can keep CMAKE_INSTALL_PREFIX=/usr/local, which fails
# without root. Point every linux build dir at its local bundle instead.
fix_linux_install_prefix() {
  local build_root="$DIR/application/build/linux"
  [[ -d "$build_root" ]] || return 0

  local cache
  while IFS= read -r cache; do
    [[ -f "$cache" ]] || continue
    if grep -q 'CMAKE_INSTALL_PREFIX:PATH=/usr/local' "$cache"; then
      local build_dir
      build_dir="$(dirname "$cache")"
      echo "Fixing CMake install prefix in $build_dir"
      cmake -DCMAKE_INSTALL_PREFIX="$build_dir/bundle" "$build_dir"
    fi
  done < <(find "$build_root" -name CMakeCache.txt)
}

fix_linux_install_prefix

# Run on Linux Desktop
flutter run -d linux
