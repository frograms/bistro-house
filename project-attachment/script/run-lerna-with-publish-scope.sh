#!/bin/bash
# lerna-publish-scope.txt 가 있으면 --scope 를 붙여 pnpm lerna 를 실행합니다.
#
# Usage:
#   bash run-lerna-with-publish-scope.sh changed --parseable
#   bash run-lerna-with-publish-scope.sh publish --yes --conventional-commits --no-push
#
# lerna-publish-scope.txt (repo root, optional):
#   - npm package name 한 줄에 하나 (lerna list name 과 동일, 예: @watcha-authentic/eslint-config)
#   - lerna list 에 없는 줄 → exit 1
#   - 빈 파일·파일 없음 → scope 없이 실행

set -e

SCOPE_ARGS=()

if [ -f lerna-publish-scope.txt ]; then
  mapfile -t LERNA_PACKAGE_NAMES < <(
    pnpm lerna list -pl 2>/dev/null | awk -F: '/^\// {print $2}'
  )

  while IFS= read -r line || [ -n "$line" ]; do
    if ! printf '%s\n' "${LERNA_PACKAGE_NAMES[@]}" | grep -qxF "$line"; then
      echo "❌ lerna workspace에 없는 package: $line" >&2
      exit 1
    fi

    SCOPE_ARGS+=(--scope "$line")
  done < lerna-publish-scope.txt
fi

pnpm lerna "$@" "${SCOPE_ARGS[@]}"
