#!/bin/bash

# from 패키지 dependencies 에 to 패키지를 workspace:* 로 추가합니다.
#
# Usage
# - bash ./project-attachment/script/set-workspace-deps.sh <from-package-name> <to-package-name>
# - pnpm set-workspace-deps <from-package-name> <to-package-name>
#
# Arguments
# - from-package-name: 의존성을 받을 패키지 (짧은 이름 또는 @watcha-authentic/*)
# - to-package-name:   의존성으로 넣을 패키지 (짧은 이름 또는 @watcha-authentic/*)
#
# 예
# - pnpm set-workspace-deps test-package react-a11y
#   → @watcha-authentic/test-package 에
#     "@watcha-authentic/react-a11y": "workspace:*"

set -e

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/../.." && pwd)"
scope="@watcha-authentic"

usage() {
  echo "사용법:"
  echo "  pnpm set-workspace-deps <from-package-name> <to-package-name>"
  echo "  bash ./project-attachment/script/set-workspace-deps.sh <from-package-name> <to-package-name>"
  echo ""
  echo "  <from-package-name>  의존성을 받을 패키지"
  echo "  <to-package-name>    의존성으로 넣을 패키지"
  echo ""
  echo "  짧은 이름 또는 ${scope}/* 전체 이름"
  echo "  예: pnpm set-workspace-deps test-package react-a11y"
}

to_full_name() {
  local package_arg="$1"

  if [[ "$package_arg" == @* ]]; then
    printf '%s' "$package_arg"
  else
    printf '%s' "${scope}/${package_arg}"
  fi
}

to_short_name() {
  local package_arg="$1"

  if [[ "$package_arg" == @* ]]; then
    printf '%s' "${package_arg#${scope}/}"
  else
    printf '%s' "$package_arg"
  fi
}

from_arg="${1:-}"
to_arg="${2:-}"

if [ "$from_arg" = "-h" ] || [ "$from_arg" = "--help" ] || [ "$to_arg" = "-h" ] || [ "$to_arg" = "--help" ]; then
  usage
  exit 0
fi

if [ -z "$from_arg" ] || [ -z "$to_arg" ]; then
  echo "❌ 오류: from-package-name 과 to-package-name 이 필요합니다."
  echo ""
  usage
  exit 1
fi

cd "$root_dir"

from_full=$(to_full_name "$from_arg")
to_full=$(to_full_name "$to_arg")
to_short=$(to_short_name "$to_arg")

if [ ! -f "$root_dir/packages/${to_short}/package.json" ]; then
  echo "❌ 오류: to 패키지를 찾을 수 없습니다: packages/${to_short}"
  exit 1
fi

echo "📎 ${from_full} ← ${to_full}@workspace:*"
pnpm add "${to_full}@workspace:*" --filter="${from_full}" --save-exact
echo "✅ 완료"
