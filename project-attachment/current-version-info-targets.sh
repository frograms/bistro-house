#!/bin/bash
# 변경된 패키지 경로(stdin)마다 Lerna git 태그 형식(name@version) JSON manifest를 출력합니다.
#
# Usage:
#   printf '%s\n' "$PATHS" | bash ./project-attachment/current-version-info-targets.sh
#
# 출력: 한 줄 JSON 배열
#   [{"tag":"@scope/pkg@1.0.0","package_path":"/abs/path/to/pkg"}, ...]

set -e

if [ "$#" -gt 0 ]; then
  CHANGED_PACKAGES=$(printf '%s\n' "$@")
elif [ -t 0 ]; then
  echo "패키지 경로가 없습니다. stdin 또는 인자로 절대 경로를 전달하세요." >&2
  exit 2
else
  CHANGED_PACKAGES=$(cat)
fi

if [ -z "$CHANGED_PACKAGES" ]; then
  echo "[]"
  exit 0
fi

entries=()

while IFS= read -r package_path; do
  [ -z "$package_path" ] && continue
  if [ ! -f "$package_path/package.json" ]; then
    echo "package.json 없음: $package_path" >&2
    exit 1
  fi

  name=$(jq -r '.name // empty' "$package_path/package.json")
  version=$(jq -r '.version // empty' "$package_path/package.json")

  if [ -z "$name" ] || [ -z "$version" ]; then
    echo "name/version 파싱 실패: $package_path" >&2
    exit 1
  fi

  tag="${name}@${version}"
  abs_path=$(cd "$package_path" && pwd)
  entries+=("$(jq -nc --arg tag "$tag" --arg package_path "$abs_path" '{tag:$tag, package_path:$package_path}')")
done <<< "$CHANGED_PACKAGES"

if [ "${#entries[@]}" -eq 0 ]; then
  echo "[]"
  exit 0
fi

printf '%s\n' "${entries[@]}" | jq -sc '.'
