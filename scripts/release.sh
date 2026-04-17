#!/bin/bash
set -e

cd apps/app

OUTPUT_DIR="builds/ios"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IPA="$OUTPUT_DIR/build-$TIMESTAMP.ipa"

echo "Building iOS release..."
bunx eas-cli build --platform ios --profile production --local --output "$IPA"

echo "Submitting $IPA..."
bunx eas-cli submit --platform ios --profile production --path "$IPA"

echo "Done! $IPA submitted to App Store Connect."
