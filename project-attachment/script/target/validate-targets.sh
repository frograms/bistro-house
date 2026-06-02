#!/bin/bash
# 전달받은 패키지에 validate 검사를 실행합니다.
# 해당 패키지에 다음 스크립트가 구현되어 있어야 합니다.
# - test
# - lint
# - validate
#
# Usage:
#   .../validate-targets.sh [package-root ...]
#   bash ./project-attachment/script/get-changed-targets-by-latest.sh | bash ./project-attachment/script/target/validate-targets.sh
#   printf '%s\n' ... | .../validate-targets.sh

set -e

echo "밸리데이션을 진행합니다..."

if [ "$#" -gt 0 ]; then
  CHANGED_PACKAGES=$(printf '%s\n' "$@")
elif [ -t 0 ]; then
  echo "대상 패키지 경로가 없습니다. stdin 또는 인자로 절대 경로를 전달하세요." >&2
  exit 2
else
  CHANGED_PACKAGES=$(cat)
fi

if [ -z "$CHANGED_PACKAGES" ]; then
  echo "✅ 변경된 패키지가 없습니다. 파이프라인 작업을 건너 뜁니다."
  exit 0
fi

echo "다음 대상에 밸리데이션을 진행합니다..."
echo "$CHANGED_PACKAGES"

FILTER_ARGS=()
while IFS= read -r PACKAGE_PATH; do
  [ -z "$PACKAGE_PATH" ] && continue

  PACKAGE_NAME=$(node -p "require('$PACKAGE_PATH/package.json').name")
  echo "👉 $PACKAGE_NAME ($(basename "$PACKAGE_PATH"))"

  HAS_LINT=$(node -p "require('$PACKAGE_PATH/package.json').scripts?.lint ? 'yes' : 'no'")
  HAS_TEST=$(node -p "require('$PACKAGE_PATH/package.json').scripts?.test ? 'yes' : 'no'")
  HAS_VALIDATE=$(node -p "require('$PACKAGE_PATH/package.json').scripts?.validate ? 'yes' : 'no'")
  if [ "$HAS_LINT" = "yes" ] && [ "$HAS_TEST" = "yes" ] && [ "$HAS_VALIDATE" = "yes" ]; then
    FILTER_ARGS+=("--filter=$PACKAGE_NAME")
  else
    echo "⛔️ $PACKAGE_NAME 패키지에 밸리데이션 필수 스크립트(test, lint, validate)가 없습니다. 스크립트를 구성해주세요."
    exit 1
  fi
done <<< "$CHANGED_PACKAGES"

if [ ${#FILTER_ARGS[@]} -eq 0 ]; then
  echo "❌ 검증할 패키지가 없습니다."
  exit 1
fi

if ! pnpm exec turbo run test lint validate "${FILTER_ARGS[@]}"; then
  echo "❌ 밸리데이션 검사에 실패 했습니다."
  exit 1
fi

echo "✅ 밸리데이션 검사에 성공 했습니다."
