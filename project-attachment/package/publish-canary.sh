#!/bin/bash

# @watcha-authentic/* 패키지를 npm canary 태그로 배포합니다.
#
# 배포 버전 형식: {package.json 버전}-canary.{브랜치명}.{순번}
#   예) 0.1.1-canary.feature-init.0
#
# 실행 (저장소 루트):
#   bash ./project-attachment/package/publish-canary.sh <package>
#   pnpm publish:canary <package>
#
# 사전 준비:
#   npm login (@watcha-authentic publish 권한)

set -e

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/../.." && pwd)"

# 스크립트 변수
full_package_name=""
short_name=""
package_dir=""
package_json=""
branch_name=""
current_version=""
canary_version=""
version_bumped=0

usage() {
  echo "사용법: bash ./project-attachment/package/publish-canary.sh <package>"
  echo ""
  echo "  <package>  패키지 짧은 이름 또는 전체 이름"
  echo "             예: react-slider, eslint-config, @watcha-authentic/react-a11y"
  echo ""
  echo "packages/ 아래 배포 가능한 패키지:"
  for dir in packages/*/; do
    if [ -f "${dir}package.json" ]; then
      node -p "require('./${dir}package.json').name" 2>/dev/null || true
    fi
  done
}

# 배포 전 인자, 패키지, Git, npm, 카나리 버전을 검증합니다.
validate() {
  local package_arg="$1"

  # 패키지 이름 인자가 없으면 사용법을 보여주고 종료합니다
  if [ -z "$package_arg" ]; then
    echo "❌ 오류: 패키지 이름이 필요합니다."
    echo ""
    usage
    return 1
  fi

  # 입력값을 npm 패키지명과 packages/ 하위 경로로 해석합니다
  if [[ "$package_arg" == @* ]]; then
    full_package_name="$package_arg"
    short_name="${package_arg#@watcha-authentic/}"
    # @watcha-authentic 스코프가 아니면 거절합니다
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

  # packages/{name}/package.json 이 있는지 확인합니다
  if [ ! -f "$package_json" ]; then
    echo "❌ 오류: ${package_dir} 에서 패키지를 찾을 수 없습니다."
    echo ""
    usage
    return 1
  fi

  # package.json의 name 필드가 기대한 패키지명과 같은지 확인합니다
  local actual_name
  actual_name=$(node -p "require('./${package_json}').name")
  if [ "$actual_name" != "$full_package_name" ]; then
    echo "❌ 오류: package.json의 name이 일치하지 않습니다."
    echo "   기대값: $full_package_name"
    echo "   실제값: $actual_name"
    return 1
  fi

  # 배포 전 빌드가 가능하도록 build 스크립트가 있는지 확인합니다
  local has_build
  has_build=$(node -p "require('./${package_json}').scripts?.build ? 'yes' : 'no'")
  if [ "$has_build" != "yes" ]; then
    echo "❌ 오류: ${full_package_name} 의 package.json에 build 스크립트가 없습니다."
    return 1
  fi

  # 커밋되지 않은 추적 파일 변경이 있으면 배포를 막습니다
  echo "🔍 Git 수정 파일 여부를 확인합니다..."
  local modified_files
  modified_files=$(git status --porcelain | grep -E '^[ M]M|MM' || true)
  if [ -n "$modified_files" ]; then
    echo "❌ 오류: 커밋되지 않은 변경 사항이 있습니다!"
    echo "카나리 배포 전에 수정된 파일을 커밋해 주세요."
    echo "수정된 파일:"
    echo "$modified_files"
    return 1
  fi
  echo "✅ 커밋되지 않은 변경 없음 (삭제/untracked 파일은 무시)"

  # 카나리 버전에 넣을 브랜치 이름을 가져옵니다
  branch_name=$(git branch --show-current | tr '[:upper:]' '[:lower:]' | tr '/' '-')
  if [ -z "$branch_name" ]; then
    echo "❌ 오류: 현재 브랜치 이름을 확인할 수 없습니다."
    echo "   git 저장소에서 유효한 브랜치에 있는지 확인해 주세요."
    return 1
  fi
  echo "🌿 브랜치: $branch_name"

  # npm publish 전에 로그인 상태를 확인합니다
  echo "registry.npmjs.org 에 배포합니다 (npm login 필요)"
  if ! npm whoami >/dev/null 2>&1; then
    echo "❌ npm에 로그인되어 있지 않습니다."
    echo "   먼저 npm login을 실행한 뒤 다시 시도하세요."
    return 1
  fi
  echo "👤 npm 계정: $(npm whoami)"

  # npm registry 기준으로 이번에 올릴 카나리 버전 문자열을 정합니다
  current_version=$(node -p "require('./${package_json}').version")
  echo "📝 현재 버전: $current_version"

  echo "🔍 기존 canary 버전을 조회합니다..."
  local existing_canary
  existing_canary=$(npm view "$full_package_name" versions --json 2>/dev/null | grep "$current_version-canary" | wc -l | tr -d ' ')
  local next_canary_num=$((existing_canary))
  canary_version="$current_version-canary.$branch_name.$next_canary_num"
  echo "🏷️  카나리 버전: $canary_version (canary #$next_canary_num)"
}

# 대상 패키지를 빌드합니다.
build_package() {
  echo "🔨 ${full_package_name} 빌드 중..."
  pnpm build --filter="$full_package_name"
}

# canary 태그로 npm에 배포하고, package.json version을 원래 값으로 되돌립니다.
publish_canary() {
  echo "📦 카나리 배포를 진행합니다..."

  # publish 직전에 package.json version을 카나리 버전으로 잠시 바꿉니다
  (
    cd "$root_dir/$package_dir"
    npm version "$canary_version" --no-git-tag-version
  )
  version_bumped=1

  # registry.npmjs.org에 canary 태그로 올립니다
  (
    cd "$root_dir/$package_dir"
    npm publish --tag canary --access public
  )

  # 배포가 끝나면 로컬 package.json version을 원래대로 되돌립니다
  (
    cd "$root_dir/$package_dir"
    npm version "$current_version" --no-git-tag-version
  )
  version_bumped=0
}

# 배포 실패, 중단 시 package.json version을 복원합니다.
restore_package_version() {
  # 카나리 version으로 바꾼 적이 없으면 복원할 필요가 없습니다
  if [ "$version_bumped" != "1" ]; then
    return 0
  fi

  echo ""
  echo "⚠️  배포가 중단되어 package.json 버전을 ${current_version}(으)로 되돌립니다..."
  # npm version으로 되돌리고, 실패하면 git checkout으로 package.json을 복원합니다
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
  version_bumped=0
}

main() {
  cd "$root_dir"

  # -h, --help 이면 사용법만 출력합니다
  if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
  fi

  validate "$1"

  echo "🔥 ${full_package_name} 카나리 배포를 시작합니다"
  build_package
  publish_canary

  echo "✅ 카나리 배포가 완료되었습니다!"
  echo "🏷️  배포됨: ${full_package_name}@${canary_version}"
  echo "📦 설치: pnpm add ${full_package_name}@${canary_version}"
  echo "📦 또는 canary 태그: pnpm add ${full_package_name}@canary"
}

trap restore_package_version EXIT
main "$@"
