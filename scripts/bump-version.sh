#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/bump-version.sh <version>"
  exit 1
fi

echo "Bumping to v$VERSION..."

# Update all package.json files
for pkg in package.json apps/*/package.json packages/*/package.json; do
  if [ -f "$pkg" ]; then
    tmp=$(mktemp)
    sed "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" "$pkg" > "$tmp" && mv "$tmp" "$pkg"
    echo "  Updated $pkg"
  fi
done

# Run expo prebuild to sync native projects
echo "Running prebuild..."
cd apps/app
bunx expo prebuild --clean
cd ../..

echo "Done! Version bumped to $VERSION"
