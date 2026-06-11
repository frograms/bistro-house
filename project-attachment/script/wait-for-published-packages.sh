#!/bin/bash
# npm publish 직후 HEAD release tag 버전이 registry에 보일 때까지 대기한다.
# 다음 pnpm install이 새 버전을 resolve할 수 있게 한다.
#
# Usage: bash wait-for-published-packages.sh
# 입력: HEAD의 release tag
#   - latest: @watcha-authentic/eslint-config@1.2.1
#   - patch:  @watcha-authentic/react-slider@1.1.0-patch.1
# 종료 코드: 전부 확인 시 0, 시간 초과 시 1

set -euo pipefail

MAX_ATTEMPTS="${WAIT_PUBLISHED_PACKAGES_MAX_ATTEMPTS:-30}"
DELAY_SECONDS="${WAIT_PUBLISHED_PACKAGES_DELAY_SECONDS:-5}"

# lerna tag → npm view용 라벨 (예: @scope/pkg@1.2.3)
format_release_tag() {
  local tag="$1"
  echo "${tag%@*}@${tag##*@}"
}

is_on_npm_registry() {
  npm view "$(format_release_tag "$1")" version >/dev/null 2>&1
}

print_release_tags() {
  local prefix="$1"
  shift
  local tags=("$@")

  for tag in "${tags[@]}"; do
    echo "${prefix}$(format_release_tag "$tag")"
  done
}

join_release_tags() {
  local labels=()
  local tag

  for tag in "$@"; do
    labels+=("$(format_release_tag "$tag")")
  done

  echo "${labels[*]}"
}

# HEAD의 scoped release tag만 수집한다. (latest lerna tag, patch prerelease tag)
collect_release_tags_at_head() {
  local tag

  pending_tags=()

  while IFS= read -r tag; do
    [[ "$tag" =~ ^@.+@[0-9] ]] || continue
    pending_tags+=("$tag")
  done < <(git tag --points-at HEAD)
}

# pending_tags에서 registry에 보이는 항목을 제거한다.
poll_pending_tags() {
  local tag
  local next_pending=()

  for tag in "${pending_tags[@]}"; do
    if is_on_npm_registry "$tag"; then
      echo "확인됨: $(format_release_tag "$tag")"
      continue
    fi

    next_pending+=("$tag")
  done

  pending_tags=("${next_pending[@]}")
}

collect_release_tags_at_head

if [ "${#pending_tags[@]}" -eq 0 ]; then
  echo "release tag 없음 — registry wait 스킵"
  exit 0
fi

echo "registry 전파 대기 대상 (${#pending_tags[@]}):"
print_release_tags "  - " "${pending_tags[@]}"

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  poll_pending_tags

  if [ "${#pending_tags[@]}" -eq 0 ]; then
    echo "모든 publish 버전이 registry에서 확인됨"
    exit 0
  fi

  if [ "$attempt" -eq "$MAX_ATTEMPTS" ]; then
    echo "registry 전파 대기 시간 초과. 미확인:" >&2
    print_release_tags "  - " "${pending_tags[@]}" >&2
    exit 1
  fi

  echo "대기 중 (${attempt}/${MAX_ATTEMPTS}): $(join_release_tags "${pending_tags[@]}")"
  sleep "$DELAY_SECONDS"
done
