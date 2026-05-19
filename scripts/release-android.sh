#!/bin/bash
set -e

cd apps/app

OUTPUT_DIR="builds/android"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
AAB="$OUTPUT_DIR/build-$TIMESTAMP.aab"

echo "Building Android release bundle..."
bunx eas-cli build \
  --platform android \
  --profile production \
  --local \
  --output "$AAB"

echo "Submitting $AAB..."
bunx eas-cli submit \
  --platform android \
  --profile production \
  --path "$AAB"

echo "Done! $AAB submitted to Google Play."