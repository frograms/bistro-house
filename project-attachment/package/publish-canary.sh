#!/bin/bash

# canary 채널 배포 — publish-prerelease.sh 로 위임합니다.
#
# Usage: bash ./project-attachment/package/publish-canary.sh <package>
#
# auth 는 publish-prerelease.sh 에 login 으로 전달합니다.
# - 자세한 값: publish-prerelease.sh --help

set -e
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
package_name="${1:-}"

bash "$script_dir/publish-prerelease.sh" canary "$package_name" login
