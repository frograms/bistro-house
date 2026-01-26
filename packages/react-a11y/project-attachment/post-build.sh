#!/bin/bash
set -e

echo "Post build 스크립트가 실행 됩니다."

echo "📁 Copy d.ts in src"
find "src" -type f -name "*.d.ts" | while read -r FILE; do
  # 대상 파일의 상대 경로
  RELATIVE_PATH="${FILE#src/}"
  TARGET="dist/type/$RELATIVE_PATH"

  echo "$RELATIVE_PATH → ${TARGET}"
  mkdir -p "$(dirname "$TARGET")"
  cp "$FILE" "$TARGET"

  for ADDITIONAL_MODULE in "dist/esm" "dist/cjs"; do
    JS_PATH=${RELATIVE_PATH%.d.ts}.js
    JS_TARGET="${ADDITIONAL_MODULE}/${JS_PATH}"
    if [ ! -f "$JS_TARGET" ]; then
      mkdir -p "$(dirname "$JS_TARGET")"
      if [ "$ADDITIONAL_MODULE" = "dist/cjs" ]; then
        echo "module.exports = {};" > "$JS_TARGET"
      else
        echo "export {};" > "$JS_TARGET"
      fi
      echo "$RELATIVE_PATH → ${JS_TARGET}"
    fi
  done
done
echo ""

echo "✅ Post build 스크립트가 실행 완료 되었습니다."
