#!/bin/bash

# bistro-house용 create-package preset.
#
# 사용: bash ./project-attachment/script/add-package.sh <type> <project-name> <project-description> [options...]
# 예: pnpm add-package lib my-pkg "패키지 설명"
#     pnpm add-package lib my-pkg "패키지 설명" --without-install
#
# 고정: author, can-publish, dest-dir(=packages/<name>), license (mit), license-holder, project-git-url, project-organization, project-homepage, --yes
# 4번째 인자부터 create-package에 그대로 전달.

set -e

repo_git_url="https://github.com/frograms/bistro-house"

usage() {
  echo "Usage: bash ./project-attachment/script/add-package.sh <type> <project-name> <project-description> [options...]"
  echo "  type: lib | react | react-vite"
  exit 1
}

[[ $# -ge 3 ]] || usage

package_type="$1"
project_name="$2"
project_description="$3"
shift 3

project_homepage="${repo_git_url}/tree/master/packages/${project_name}#readme"

pnpm --filter=@watcha-authentic/common-cli dev create-package \
  --author-email=web-dev-group@watcha.com \
  --author-name=web-dev-group \
  --author-url=https://github.com/frograms \
  --can-publish \
  --dest-dir="./packages/${project_name}" \
  --license=mit \
  --license-holder='Watcha, Inc.' \
  --project-description="$project_description" \
  --project-git-url="$repo_git_url" \
  --project-homepage="$project_homepage" \
  --project-name="$project_name" \
  --project-organization=watcha-authentic \
  --type="$package_type" \
  --yes \
  "$@"
