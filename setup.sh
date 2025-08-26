#!/bin/bash

# ALX Polly Setup Script
# Run this script to set up the development environment

echo "🎯 Setting up ALX Polly Development Environment..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo

# Setup environment file
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment file..."
    cp .env.example .env.local
    echo "✅ Environment file created (.env.local)"
    echo "📝 You can edit .env.local to customize your environment"
else
    echo "⚙️  Environment file already exists (.env.local)"
fi

echo

# Check TypeScript
echo "🔍 Checking TypeScript configuration..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript check failed, but continuing..."
else
    echo "✅ TypeScript check passed"
fi

echo
echo "🎉 Setup complete!"
echo
echo "📋 Next steps:"
echo "  1. Review and edit .env.local if needed"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:3000 in your browser"
echo
echo "📚 Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run type-check   - Check TypeScript types"
echo "  npm run lint         - Run linter"
echo
echo "📖 Documentation:"
echo "  README.md           - Project overview"
echo "  DEVELOPMENT.md      - Development guide"
echo "  .env.example        - Environment variables reference"
echo

# Try to start the development server
read -p "🚀 Would you like to start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔥 Starting development server..."
    npm run dev
fi
