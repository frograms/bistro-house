#!/bin/bash

# patch 채널 배포 — publish-prerelease.sh 로 위임합니다.
#
# Usage: bash ./project-attachment/script/publish-patch.sh <package> [auth]
#
# auth 는 publish-prerelease.sh 의 세 번째 인자 규칙을 따릅니다 (기본 login).
# - 자세한 값: publish-prerelease.sh --help

set -e
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
package_name="${1:-}"
npm_auth="${2:-login}"

NPM_PUBLISH_ACCESS=public \
  bash "$script_dir/publish-prerelease.sh" patch "$package_name" "$npm_auth" false
