#!/usr/bin/env bash
set -euo pipefail

SRC="writeflow-studio-icon.svg"
OUT_MIN="writeflow-studio-icon.min.svg"
PNG_DIR="png"

mkdir -p "$PNG_DIR"

echo "[0/5] Prefer official tauri icon generator if available"
if command -v tauri >/dev/null 2>&1; then
  echo "tauri CLI detected; generating platform icons from compact SVG..."
  tauri icon writeflow-studio-icon-compact.svg -o .
  echo "Done via tauri icon"
  exit 0
fi

echo "[1/5] Optimize SVG with svgo"
if command -v svgo >/dev/null 2>&1; then
  npx --yes svgo "$SRC" -o "$OUT_MIN" 2>/dev/null || svgo "$SRC" -o "$OUT_MIN"
else
  echo "svgo not found, skip optimization (install with: npm i -g svgo)"
  cp "$SRC" "$OUT_MIN"
fi

echo "[2/5] Generate PNG sizes with ImageMagick"

# 小尺寸使用简化版本
small_sizes=(16 32)
for s in "${small_sizes[@]}"; do
  magick convert "writeflow-studio-icon-small.svg" \
    -resize ${s}x${s} \
    -background none -alpha on \
    -strip -depth 8 -define png:color-type=6 \
    "$PNG_DIR/icon-${s}.png"
done

# 大尺寸使用完整版本
large_sizes=(64 128 256 512)
for s in "${large_sizes[@]}"; do
  magick convert "$SRC" \
    -resize ${s}x${s} \
    -background none -alpha on \
    -strip -depth 8 -define png:color-type=6 \
    "$PNG_DIR/icon-${s}.png"
done

echo "[3/5] Create Windows ICO"
magick convert \
  "$PNG_DIR/icon-16.png" \
  "$PNG_DIR/icon-32.png" \
  "$PNG_DIR/icon-64.png" \
  "$PNG_DIR/icon-128.png" \
  "$PNG_DIR/icon-256.png" \
  writeflow-studio.ico

echo "[4/5] Create macOS ICNS"
ICONSET="WriteFlowStudio.iconset"
rm -rf "$ICONSET"
mkdir -p "$ICONSET"
cp "$PNG_DIR/icon-16.png"  "$ICONSET/icon_16x16.png"
cp "$PNG_DIR/icon-32.png"  "$ICONSET/icon_16x16@2x.png"
cp "$PNG_DIR/icon-32.png"  "$ICONSET/icon_32x32.png"
cp "$PNG_DIR/icon-64.png"  "$ICONSET/icon_32x32@2x.png"
cp "$PNG_DIR/icon-128.png" "$ICONSET/icon_128x128.png"
cp "$PNG_DIR/icon-256.png" "$ICONSET/icon_128x128@2x.png"
cp "$PNG_DIR/icon-256.png" "$ICONSET/icon_256x256.png"
cp "$PNG_DIR/icon-512.png" "$ICONSET/icon_256x256@2x.png"
cp "$PNG_DIR/icon-512.png" "$ICONSET/icon_512x512.png"
iconutil -c icns "$ICONSET"

echo "[5/5] Done. Artifacts:"
ls -1 "$OUT_MIN" writeflow-studio.ico WriteFlowStudio.icns "$PNG_DIR"/*.png
