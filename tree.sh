#!/bin/bash

# Show project tree structure
echo "=========================================="
echo "  Project Structure"
echo "=========================================="
echo ""

# Show tree excluding unnecessary folders
tree -a -I "venv|env|.venv|node_modules|__pycache__|.git|.idea|.vscode|dist|build|target|*.pyc|*.pyo" --dirsfirst > tree.txt