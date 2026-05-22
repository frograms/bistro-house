#!/bin/bash
# latest(lerna changed) 기준으로 변경된 packages/* 경로(절대 경로)를 한 줄에 하나씩 출력합니다.
#
# Usage: bash get-changed-targets-by-latest.sh
#
# 출력 예 (변경된 패키지마다 1줄, 절대 경로):
#   {workspace-path}/packages/<name>

set +e

emit_changed_packages() {
  while read -r PACKAGE_PATH; do
    if [ -d "$PACKAGE_PATH" ] && [ -f "$PACKAGE_PATH/package.json" ]; then
      echo "$(cd "$PACKAGE_PATH" && pwd)"
    fi
  done
}

pnpm exec lerna changed --parseable | emit_changed_packages

set -e
