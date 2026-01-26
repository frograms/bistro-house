#!/bin/bash
set -e

# 첫 번째 인자, 없으면 기본값 'dist/esm'
DIST_DIR="${1:-dist/esm}"
# 두 번째 인자, 없으면 기본값 ["@/"]
PREFIXES_JSON="${2:-[\"@/\"]}"
PREFIXES=()

# JSON 문자열에서 prefix 배열로 파싱
IFS=',' read -ra RAW_PREFIXES <<< "$(echo "$PREFIXES_JSON" | sed -E 's/[\[\]"]//g')"
for raw in "${RAW_PREFIXES[@]}"; do
  PREFIXES+=("$raw")
done

echo "📁 fix-import"
echo " > Import path fixer 시작: 디렉토리 = $DIST_DIR"
echo " > 내부 코드 prefix = ${PREFIXES[*]}"
echo ""

# 모든 .js 파일을 순회
find "$DIST_DIR" -type f -name "*.js" | while read -r FILE; do
  MODIFIED=false
  CONTENT="$(<"$FILE")"

  # 임시 복사본 생성
  TMP_FILE="$FILE.tmp"

  while IFS= read -r LINE || [[ -n "$LINE" ]]; do
    if [[ "$LINE" =~ from\ \"([^\"]+)\" ]]; then
      IMPORT_PATH="${BASH_REMATCH[1]}"
      # 상대 경로 또는 prefix로 시작하고 .js가 없는 경우에만
      if [[ "$IMPORT_PATH" != *.js ]] && [[ "$IMPORT_PATH" != http* ]] && [[ "$IMPORT_PATH" != *\?* ]]; then
        if [[ "$IMPORT_PATH" == ./* || "$IMPORT_PATH" == ../* ]]; then
          PATCHED_PATH="${IMPORT_PATH}.js"
        else
          PATCHED_PATH="$IMPORT_PATH"
          for PREFIX in "${PREFIXES[@]}"; do
            if [[ "$IMPORT_PATH" == "$PREFIX"* ]]; then
              PATCHED_PATH="${IMPORT_PATH}.js"
              break
            fi
          done
        fi

        if [[ "$PATCHED_PATH" != "$IMPORT_PATH" ]]; then
          # 라인 수정
          LINE=$(echo "$LINE" | sed "s|from \"$IMPORT_PATH\"|from \"$PATCHED_PATH\"|")
          MODIFIED=true
        fi
      fi
    fi
    echo "$LINE" >> "$TMP_FILE"
  done <<< "$CONTENT"

  # 파일 덮어쓰기
  if [ "$MODIFIED" = true ]; then
    mv "$TMP_FILE" "$FILE"
    echo "✔ Patched: ${FILE}"
  else
    rm "$TMP_FILE"
  fi
done

echo ""
echo "✅ import 경로 수정 완료"
