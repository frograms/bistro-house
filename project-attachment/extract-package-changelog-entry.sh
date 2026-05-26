#!/bin/bash
# package.json version에 해당하는 CHANGELOG.md 최상단 섹션을 stdout으로 출력합니다.
#
# Usage: bash ./project-attachment/extract-package-changelog-entry.sh <package-root>

set -e

package_path=${1:?package root required}
changelog_file="$package_path/CHANGELOG.md"

if [ ! -f "$package_path/package.json" ]; then
  echo "package.json 없음: $package_path" >&2
  exit 1
fi

version=$(jq -r '.version // empty' "$package_path/package.json")
if [ -z "$version" ]; then
  echo "version 파싱 실패: $package_path" >&2
  exit 1
fi

if [ ! -f "$changelog_file" ]; then
  echo "CHANGELOG 없음: $changelog_file" >&2
  exit 2
fi

awk -v ver="$version" '
  /^# / {
    if (matched) exit
    if ($0 ~ "^# " ver "([ (]|$)") {
      matched = 1
    }
  }
  matched { print }
' "$changelog_file"
