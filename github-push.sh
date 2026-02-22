#!/bin/bash
# Run this from the project folder after creating a new repo on GitHub.
# Usage: ./github-push.sh
# Or: bash github-push.sh

set -e
cd "$(dirname "$0")"

# If you get "Xcode license" error, run this once in Terminal first:
#   sudo xcodebuild -license
# Then agree and come back to run this script.

echo "→ Initializing git (if needed)..."
git init 2>/dev/null || true

echo "→ Staging all files..."
git add .

echo "→ Committing..."
git commit -m "AI 10 Workshop progress app with auth and teams" 2>/dev/null || git commit -m "AI 10 Workshop progress app with auth and teams"

echo "→ Setting main branch..."
git branch -M main

echo ""
echo "Next: add your GitHub repo and push."
echo "1. Create a new repository on https://github.com/new (no README, no .gitignore)."
echo "2. Run ONE of these (replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git push -u origin main"
echo ""
echo "Or if you use SSH:"
echo "   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git"
echo "   git push -u origin main"
echo ""
