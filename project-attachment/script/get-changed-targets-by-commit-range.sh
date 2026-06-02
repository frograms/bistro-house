#!/bin/bash
# 두 ref 사이 diff 에서 수정된 packages/* 경로(절대 경로)를 한 줄에 하나씩 출력합니다.
#
# Usage: bash get-changed-targets-by-commit-range.sh <base-sha> <head-sha>
#
# 출력 예 (변경된 패키지마다 1줄, 절대 경로):
#   {workspace-path}/packages/<name>

set +e

BASE_SHA="${1:?base-sha required}"
HEAD_SHA="${2:?head-sha required}"

emit_changed_packages() {
  while read -r PACKAGE_PATH; do
    if [ -d "$PACKAGE_PATH" ] && [ -f "$PACKAGE_PATH/package.json" ]; then
      echo "$(cd "$PACKAGE_PATH" && pwd)"
    fi
  done
}

git diff --name-only "$BASE_SHA" "$HEAD_SHA" 2>/dev/null |
  grep -E '^packages/[^/]+/' |
  cut -d/ -f1,2 |
  sort -u |
  emit_changed_packages

set -e
