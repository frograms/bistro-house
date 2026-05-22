#!/bin/bash
# 지정한 커밋에서 수정된 packages/* 경로(절대 경로)를 한 줄에 하나씩 출력합니다.
#
# Usage: bash get-changed-targets-by-commit.sh [commit-sha]
#   commit-sha  분석할 커밋 (기본값: HEAD)
#
# 출력 예 (해당 커밋에서 바뀐 패키지마다 1줄, 절대 경로):
#   {workspace-path}/packages/<name>
#   {workspace-path}/packages/<name>
#   ...

set +e

COMMIT_SHA="${1:-HEAD}"

emit_changed_packages() {
  while read -r PACKAGE_PATH; do
    if [ -d "$PACKAGE_PATH" ] && [ -f "$PACKAGE_PATH/package.json" ]; then
      echo "$(cd "$PACKAGE_PATH" && pwd)"
    fi
  done
}

# 부모 커밋이 있으면: 직전 커밋 대비 diff → "이 커밋에서 바뀐" packages/* 만 추출
if git rev-parse --verify "${COMMIT_SHA}^" >/dev/null 2>&1; then
  git diff --name-only "${COMMIT_SHA}^" "$COMMIT_SHA" 2>/dev/null |
    grep -E '^packages/[^/]+/' |
    cut -d/ -f1,2 |
    sort -u |
    emit_changed_packages
# 부모가 없으면(루트 커밋 등): diff 상대가 없어 git show 로 해당 커밋 변경 파일만 조회
else
  git show --name-only --pretty=format: "$COMMIT_SHA" 2>/dev/null |
    grep -E '^packages/[^/]+/' |
    cut -d/ -f1,2 |
    sort -u |
    emit_changed_packages
fi

set -e
