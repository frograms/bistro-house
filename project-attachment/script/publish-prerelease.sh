#!/bin/bash

# @watcha-authentic/* 패키지를 prerelease 배포 채널로 배포합니다.
#
# 실행
# - bash ./project-attachment/script/publish-prerelease.sh <channel> <package> [auth] <cleanup>
# - auth: login (기본) | npm-oidc
# - cleanup: true | false — EXIT 시 이 스크립트에서 수정한 사항에 대해 버전 복원 여부 (publish-canary/patch 에서 전달)
#
# 채널
# - canary {version}-canary.{branch}.{n} dist-tag: canary
# - patch {version}-patch.{n} dist-tag: patch
#
# auth (세 번째 인자, 기본 login)
# - login — npm login 세션으로 인증 (npm whoami)
# - npm-oidc — npm OIDC(Trusted Publishing) 자동 인증
#
# 성공 시 마지막 줄 publish-prerelease-result-tag=@scope/pkg@version (태그 결과 grep용)

set -e

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/../.." && pwd)"

channel=""
npm_auth="login"
cleanup_on=""

full_package_name=""
short_name=""
package_dir=""
package_json=""
current_version=""
publish_version=""
cleanup_pending=0

# --- usage ---

usage() {
  echo "사용법:"
  echo "  bash ./project-attachment/script/publish-prerelease.sh <channel> <package> [auth] <cleanup>"
  echo ""
  echo "  <auth>     npm 인증 방식 (생략 시 login)"
  echo "    login    npm login 후 whoami 로 확인"
  echo "    npm-oidc npm OIDC(Trusted Publishing) 자동 인증"
  echo ""
  echo "  <cleanup>  true | false (필수 — 래퍼 publish-canary/patch 가 전달)"
  echo "    true     EXIT 시 이 스크립트에서 수정한 사항에 대해(package.json 등) 버전 복원"
  echo "    false    EXIT 복원 없음"
  echo ""
  echo "  <channel>  canary | patch"
  echo "    canary  {version}-canary.{branch}.{n}"
  echo "    patch   {version}-patch.{n}"
  echo ""
  echo "  <package>  패키지 짧은 이름 또는 전체 이름"
  echo "             예: react-slider, @watcha-authentic/react-a11y"
  echo ""
  echo "packages/ 아래 배포 가능한 패키지:"
  for dir in "$root_dir"/packages/*/; do
    if [ -f "${dir}package.json" ]; then
      node -p "require('${dir}package.json').name" 2>/dev/null || true
    fi
  done
}

# --- validation ---

validate_channel() {
  case "$channel" in
    canary | patch) return 0 ;;
    *)
      echo "❌ 오류: 알 수 없는 channel 입니다: $channel"
      echo "   사용 가능: canary, patch"
      return 1
      ;;
  esac
}

resolve_package() {
  local package_arg="$1"

  if [ -z "$package_arg" ]; then
    echo "❌ 오류: 패키지 이름이 필요합니다."
    echo ""
    usage
    return 1
  fi

  if [[ "$package_arg" == @* ]]; then
    full_package_name="$package_arg"
    short_name="${package_arg#@watcha-authentic/}"
    if [ "$short_name" = "$package_arg" ]; then
      echo "❌ 오류: @watcha-authentic/* 스코프 패키지만 지원합니다."
      echo "   입력값: $package_arg"
      return 1
    fi
  else
    short_name="$package_arg"
    full_package_name="@watcha-authentic/${short_name}"
  fi

  package_dir="packages/${short_name}"
  package_json="${package_dir}/package.json"

  if [ ! -f "$root_dir/$package_json" ]; then
    echo "❌ 오류: ${package_dir} 에서 패키지를 찾을 수 없습니다."
    echo ""
    usage
    return 1
  fi

  local actual_name
  actual_name=$(node -p "require('./${package_json}').name")
  if [ "$actual_name" != "$full_package_name" ]; then
    echo "❌ 오류: package.json의 name이 일치하지 않습니다."
    echo "   기대값: $full_package_name"
    echo "   실제값: $actual_name"
    return 1
  fi

  local has_build
  has_build=$(node -p "require('./${package_json}').scripts?.build ? 'yes' : 'no'")
  if [ "$has_build" != "yes" ]; then
    echo "❌ 오류: ${full_package_name} 의 package.json에 build 스크립트가 없습니다."
    return 1
  fi

  current_version=$(node -p "require('./${package_json}').version")
  return 0
}

validate_git_clean() {
  echo "🔍 Git 수정 파일 여부를 확인합니다..."
  local modified_files
  modified_files=$(git status --porcelain | grep -E '^[ M]M|MM' || true)
  if [ -n "$modified_files" ]; then
    echo "❌ 오류: 커밋되지 않은 변경 사항이 있습니다!"
    echo "배포 전에 수정된 파일을 커밋해 주세요."
    echo "수정된 파일:"
    echo "$modified_files"
    return 1
  fi
  echo "✅ 커밋되지 않은 변경 없음 (삭제/untracked 파일은 무시)"
  return 0
}

verify_npm_auth() {
  case "$npm_auth" in
    npm-oidc)
      echo "registry.npmjs.org — npm OIDC(Trusted Publishing)로 자동 인증합니다."
      ;;
    login)
      echo "registry.npmjs.org 에 배포합니다 (npm login 필요)"
      if ! npm whoami >/dev/null 2>&1; then
        echo "❌ npm에 로그인되어 있지 않습니다."
        echo "   먼저 npm login을 실행한 뒤 다시 시도하세요."
        return 1
      fi
      echo "👤 npm 계정: $(npm whoami)"
      ;;
    *)
      echo "❌ 알 수 없는 auth: ${npm_auth} (login | npm-oidc)"
      return 1
      ;;
  esac
}

validate() {
  local package_arg="$1"

  resolve_package "$package_arg" || return 1
  validate_git_clean || return 1
  verify_npm_auth || return 1

  echo "📝 현재 버전 (package.json): $current_version"
  publish_version=$(resolve_publish_version "$current_version" "$full_package_name") || return 1
  if [ -z "$publish_version" ]; then
    echo "❌ 오류: 배포 버전을 결정하지 못했습니다."
    return 1
  fi
  echo "🏷️  배포 버전: $publish_version (dist-tag: ${channel})"
}

# --- version resolution ---

fetch_npm_versions_json() {
  local package_name="$1"
  local json

  json=$(npm view "$package_name" versions --json 2>/dev/null) || json="null"
  if [ -z "$json" ] || [ "$json" = "null" ]; then
    echo "[]"
  else
    echo "$json"
  fi
}

next_prerelease_index_for_prefix() {
  local versions_json="$1"
  local version_prefix="$2"

  if ! command -v jq >/dev/null 2>&1; then
    echo "❌ 오류: 다음 prerelease 번호 계산에 jq 가 필요합니다." >&2
    return 1
  fi

  echo "$versions_json" | jq -r --arg prefix "$version_prefix" '
    (if type == "string" then [.] elif type == "array" then . else [] end)
    | map(select(type == "string" and startswith($prefix)))
    | map(ltrimstr($prefix) | select(test("^[0-9]+$")) | tonumber)
    | if length == 0 then 0 else (max + 1) end
  '
}

resolve_canary_version() {
  local base_version="$1"
  local package_name="$2"
  local branch_name
  local version_prefix
  local versions_json
  local next_canary_num

  branch_name=$(git branch --show-current | tr '[:upper:]' '[:lower:]' | tr '/' '-')
  if [ -z "$branch_name" ]; then
    echo "❌ 오류: 현재 브랜치 이름을 확인할 수 없습니다." >&2
    return 1
  fi
  echo "🌿 브랜치: $branch_name" >&2

  echo "🔍 기존 canary 버전을 조회합니다..." >&2
  version_prefix="${base_version}-canary.${branch_name}."
  versions_json=$(fetch_npm_versions_json "$package_name")
  next_canary_num=$(next_prerelease_index_for_prefix "$versions_json" "$version_prefix") || return 1
  echo "🏷️  canary #${next_canary_num}" >&2
  echo "${base_version}-canary.${branch_name}.${next_canary_num}"
}

resolve_patch_version() {
  local base_version="$1"
  local package_name="$2"
  local version_prefix="${base_version}-patch."
  local versions_json
  local next_patch_num

  echo "🔍 기존 patch 버전을 조회합니다..." >&2
  versions_json=$(fetch_npm_versions_json "$package_name")
  next_patch_num=$(next_prerelease_index_for_prefix "$versions_json" "$version_prefix") || return 1
  echo "🏷️  patch #${next_patch_num}" >&2
  echo "${version_prefix}${next_patch_num}"
}

resolve_publish_version() {
  case "$channel" in
    canary) resolve_canary_version "$1" "$2" ;;
    patch) resolve_patch_version "$1" "$2" ;;
  esac
}

# --- build & publish ---

run_validate_targets() {
  local package_path
  package_path="$(cd "$root_dir/$package_dir" && pwd)"
  bash "$script_dir/target/validate-targets.sh" "$package_path"
}

build_package() {
  echo "🔨 ${full_package_name} 빌드 중..."
  pnpm build --filter="$full_package_name"
}

publish_package() {
  echo "📦 npm publish (dist-tag: ${channel})..."

  (
    cd "$root_dir/$package_dir"
    npm version "$publish_version" --no-git-tag-version
  )
  cleanup_pending=1

  (
    cd "$root_dir/$package_dir"
    npm publish --tag "$channel" --access public
  )
}

restore_package_version() {
  echo ""
  echo "↩️  package.json 버전을 ${current_version}(으)로 복원합니다..."
  if (
    cd "$root_dir/$package_dir"
    npm version "$current_version" --no-git-tag-version
  ) >/dev/null 2>&1; then
    echo "✅ 버전 복원 완료"
  elif git -C "$root_dir" checkout HEAD -- "$package_json" 2>/dev/null; then
    echo "✅ 버전 복원 완료 (git checkout)"
  else
    echo "❌ 버전 복원에 실패했습니다. ${package_json} 을 수동으로 확인해 주세요."
  fi
}

# --- cleanup (EXIT trap) ---

cleanup() {
  if [ "$cleanup_on" != "true" ]; then
    return 0
  fi
  if [ "$cleanup_pending" != "1" ]; then
    return 0
  fi

  restore_package_version
  cleanup_pending=0
}

# --- run ---

run() {
  local package_arg="$1"

  cd "$root_dir"

  validate_channel || return 1
  validate "$package_arg" || return 1

  echo "🔥 ${full_package_name} — channel: ${channel}"
  run_validate_targets || return 1
  build_package
  publish_package

  echo "✅ 배포 완료 (channel: ${channel})"
  echo "📦 pnpm add ${full_package_name}@${publish_version}"
  echo "📦 pnpm add ${full_package_name}@${channel}"
  echo "publish-prerelease-result-tag=${full_package_name}@${publish_version}"
}

# --- main ---

trap cleanup EXIT

channel="${1:-}"
package_name="${2:-}"
npm_auth="${3:-login}"
cleanup_on="${4:-}"

if [ "$channel" = "-h" ] || [ "$channel" = "--help" ]; then
  usage
  exit 0
fi

if [ "$package_name" = "-h" ] || [ "$package_name" = "--help" ]; then
  usage
  exit 0
fi

if [ -z "$channel" ] || [ -z "$package_name" ]; then
  echo "❌ 오류: channel 과 package 인자가 필요합니다."
  echo ""
  usage
  exit 1
fi

if [ -z "$cleanup_on" ]; then
  echo "❌ 오류: cleanup 인자(true|false)가 필요합니다."
  echo ""
  usage
  exit 1
fi

if [ $# -gt 4 ]; then
  echo "❌ 오류: 알 수 없는 인자가 있습니다: ${*:5}"
  echo ""
  usage
  exit 1
fi

run "$package_name"
