#!/bin/bash
set -e

echo "📁 collect-dist-styles"
echo " > CSS 파일 수집 및 압축 시작"
echo ""

mkdir -p dist
if find src -type f \( -name '*.css' -o -name '*.scss' \) | grep -q .; then
  find src -type f \( -name '*.css' -o -name '*.scss' \) -exec cat {} \; | postcss -o dist/style.css
  echo "✔ Generated: dist/style.css"
else
  echo "⚠️  CSS 파일이 없습니다. 작업을 건너뜁니다."
fi

echo ""
echo "✅ CSS 빌드 완료"
