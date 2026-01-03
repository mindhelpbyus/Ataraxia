#!/bin/bash

# Create docs directory if it doesn't exist
mkdir -p docs

# Move all .md files except README.md to docs folder
find . -maxdepth 1 -name "*.md" ! -name "README.md" -exec mv {} docs/ \;

echo "✅ Moved all documentation files to /docs/"
echo "✅ Kept README.md in root"
echo ""
echo "Files moved:"
ls -1 docs/*.md | wc -l
