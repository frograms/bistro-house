#!/bin/bash
# 변경된 패키지에 validate 검사를 실행합니다.
# 해당 패키지에 다음 스크립트가 구현되어 있어야 합니다.
# - test
# - lint

set -e

echo "밸리데이션을 진행합니다..."
echo "대상이 될 패키지를 조회합니다..."
CHANGED_PACKAGES=$(bash ./project-attachment/changed-targets.sh 2>/dev/null)
if [ -z "$CHANGED_PACKAGES" ]; then
  echo "✅ 변경된 패키지가 없습니다. 파이프라인 작업을 건너 뜁니다."
  exit 0
fi

echo "다음 대상에 밸리데이션을 진행합니다..."
echo "$CHANGED_PACKAGES"

# 변경된 패키지의 이름 목록 생성
FILTER_ARGS=()
while IFS= read -r PACKAGE_PATH; do
  [ -z "$PACKAGE_PATH" ] && continue
  
  PACKAGE_NAME=$(node -p "require('$PACKAGE_PATH/package.json').name")
  echo "👉 $PACKAGE_NAME ($(basename "$PACKAGE_PATH"))"
  
  HAS_LINT=$(node -p "require('$PACKAGE_PATH/package.json').scripts?.lint ? 'yes' : 'no'")
  HAS_TEST=$(node -p "require('$PACKAGE_PATH/package.json').scripts?.test ? 'yes' : 'no'")
  if [ "$HAS_LINT" = "yes" ] && [ "$HAS_TEST" = "yes" ]; then
    FILTER_ARGS+=("--filter=$PACKAGE_NAME")
  else
    echo "⛔️ $PACKAGE_NAME 패키지에 밸리데이션 필수 스크립트(test, validate, lint)가 없습니다. 스크립트를 구성해주세요."
    exit 1
  fi
done <<< "$CHANGED_PACKAGES"

# 필터가 없으면 에러 (이미 위에서 체크했지만 안전장치)
if [ ${#FILTER_ARGS[@]} -eq 0 ]; then
  echo "❌ 검증할 패키지가 없습니다."
  exit 1
fi

# Turbo로 검증 실행 (실패 시 exit code 전달)
if ! turbo run test lint validate "${FILTER_ARGS[@]}"; then
  echo "❌ 밸리데이션 검사에 실패 했습니다."
  exit 1
fi

echo "✅ 밸리데이션 검사에 성공 했습니다."