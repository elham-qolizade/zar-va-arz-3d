#!/usr/bin/env bash
# ZAR & ARZ 3D • Unified Execution Script

echo "======================================================"
echo "🪙 ZAR & ARZ 3D • Starting Production Engine"
echo "======================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

python3 server.py
