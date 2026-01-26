#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# This script runs before dependencies are installed

set -euo pipefail

echo "🔧 EAS Build pre-install hook started..."
echo "📁 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Check if we're in a monorepo
if [ -f "../../pnpm-workspace.yaml" ]; then
    echo "✅ Detected pnpm monorepo structure"

    # Navigate to monorepo root
    cd ../..
    echo "📁 Moved to monorepo root: $(pwd)"

    # Install pnpm if not already available
    if ! command -v pnpm &> /dev/null; then
        echo "📦 Installing pnpm globally..."
        npm install -g pnpm@8.15.0
    else
        echo "✅ pnpm is already installed: $(pnpm --version)"
    fi

    # Install all workspace dependencies
    echo "📦 Installing workspace dependencies..."
    pnpm install --frozen-lockfile --filter "app..." --filter "app^..."

    # Return to app directory
    cd apps/app
    echo "📁 Returned to app directory: $(pwd)"
else
    echo "⚠️  Not in a monorepo structure, installing normally..."
fi

echo "✅ Pre-install hook completed successfully"
