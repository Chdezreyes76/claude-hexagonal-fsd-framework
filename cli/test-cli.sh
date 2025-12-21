#!/bin/bash

# Test script for Claude Framework CLI
# This script demonstrates how to use the CLI and tests basic functionality

echo "=================================="
echo "Claude Framework CLI - Test Script"
echo "=================================="
echo ""

# Show help
echo "1. Testing help command..."
node index.js help
echo ""

# Show version
echo "2. Testing version command..."
node index.js version
echo ""

echo "=================================="
echo "To test the init wizard, run:"
echo "  node index.js init /path/to/test/project"
echo ""
echo "Or to initialize in current directory:"
echo "  node index.js init"
echo "=================================="
