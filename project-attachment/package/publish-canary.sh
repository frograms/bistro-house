#!/bin/bash

# @watcha-authentic/* canary 버전 배포 스크립트
# 현재 버전 기준으로 0.1.9-canary.{branch}.0 형태로 배포
#
# Usage (repo root):
#   bash ./project-attachment/package/publish-canary.sh <package>
#
# Examples:
#   bash ./project-attachment/package/publish-canary.sh react-slider
#   bash ./project-attachment/package/publish-canary.sh @watcha-authentic/eslint-config
#
# Prerequisite:
#   npm login — registry.npmjs.org에 @watcha-authentic publish 권한 계정으로 로그인

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

usage() {
  echo "Usage: bash ./project-attachment/package/publish-canary.sh <package>"
  echo ""
  echo "  <package>  패키지 짧은 이름 또는 전체 이름"
  echo "             예: react-slider, eslint-config, @watcha-authentic/react-a11y"
  echo ""
  echo "Available packages under packages/:"
  for dir in packages/*/; do
    if [ -f "${dir}package.json" ]; then
      node -p "require('./${dir}package.json').name" 2>/dev/null || true
    fi
  done
}

PACKAGE_ARG="${1:-}"
if [ -z "$PACKAGE_ARG" ]; then
  echo "❌ Error: package name is required."
  echo ""
  usage
  exit 1
fi

if [ "$PACKAGE_ARG" = "-h" ] || [ "$PACKAGE_ARG" = "--help" ]; then
  usage
  exit 0
fi

# 패키지 이름·경로 해석
if [[ "$PACKAGE_ARG" == @* ]]; then
  FULL_PACKAGE_NAME="$PACKAGE_ARG"
  SHORT_NAME="${PACKAGE_ARG#@watcha-authentic/}"
  if [ "$SHORT_NAME" = "$PACKAGE_ARG" ]; then
    echo "❌ Error: Only @watcha-authentic/* scoped packages are supported."
    echo "   Got: $PACKAGE_ARG"
    exit 1
  fi
else
  SHORT_NAME="$PACKAGE_ARG"
  FULL_PACKAGE_NAME="@watcha-authentic/${SHORT_NAME}"
fi

PACKAGE_DIR="packages/${SHORT_NAME}"
PACKAGE_JSON="${PACKAGE_DIR}/package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo "❌ Error: Package not found at ${PACKAGE_DIR}"
  echo ""
  usage
  exit 1
fi

ACTUAL_NAME=$(node -p "require('./${PACKAGE_JSON}').name")
if [ "$ACTUAL_NAME" != "$FULL_PACKAGE_NAME" ]; then
  echo "❌ Error: package.json name mismatch."
  echo "   Expected: $FULL_PACKAGE_NAME"
  echo "   Found:    $ACTUAL_NAME"
  exit 1
fi

HAS_BUILD=$(node -p "require('./${PACKAGE_JSON}').scripts?.build ? 'yes' : 'no'")
if [ "$HAS_BUILD" != "yes" ]; then
  echo "❌ Error: ${FULL_PACKAGE_NAME} has no build script in package.json"
  exit 1
fi

echo "🔥 Starting canary release for ${FULL_PACKAGE_NAME}"

# 0. Git 상태 확인 - 수정된 파일만 체크 (삭제/untracked 파일은 무시)
echo "🔍 Checking Git status for modified files..."
MODIFIED_FILES=$(git status --porcelain | grep -E '^[ M]M|MM' || true)
if [ -n "$MODIFIED_FILES" ]; then
  echo "❌ Error: Working directory has uncommitted changes!"
  echo "Please commit your modified files before running canary release."
  echo "Modified files:"
  echo "$MODIFIED_FILES"
  exit 1
fi
echo "✅ No uncommitted changes (deleted/untracked files are ignored)"

# 0-1. 브랜치명 기반 고유 식별자 생성
BRANCH_NAME=$(git branch --show-current | tr '[:upper:]' '[:lower:]' | tr '/' '-')
if [ -z "$BRANCH_NAME" ]; then
  echo "❌ Error: Could not determine current branch name"
  echo "   Please make sure you are in a git repository with a valid branch"
  exit 1
fi
echo "🌿 Branch: $BRANCH_NAME"

# 1. 현재 버전 확인
CURRENT_VERSION=$(node -p "require('./${PACKAGE_JSON}').version")
echo "📝 Current version: $CURRENT_VERSION"

# 2. canary 버전 생성 (순차적 번호: 0, 1, 2, 3...)
# npm에서 기존 canary 버전들을 검색해서 다음 번호 계산
echo "🔍 Checking existing canary versions..."
EXISTING_CANARY=$(npm view "$FULL_PACKAGE_NAME" versions --json 2>/dev/null | grep "$CURRENT_VERSION-canary" | wc -l | tr -d ' ')
NEXT_CANARY_NUM=$((EXISTING_CANARY))
CANARY_VERSION="$CURRENT_VERSION-canary.$BRANCH_NAME.$NEXT_CANARY_NUM"
echo "🏷️  Canary version: $CANARY_VERSION (canary #$NEXT_CANARY_NUM)"

# 3. 빌드 실행 (의존 패키지 포함 — turbo ^build)
echo "🔨 Building ${FULL_PACKAGE_NAME}..."
pnpm build --filter="$FULL_PACKAGE_NAME"

# 4. canary 배포 실행
echo "📦 Publishing canary release..."
cd "$PACKAGE_DIR"

# 4-1. 버전 임시 변경 후 배포
npm version "$CANARY_VERSION" --no-git-tag-version
echo "Publish to registry.npmjs.org (npm login required)"
if ! npm whoami >/dev/null 2>&1; then
  echo "❌ npm에 로그인되어 있지 않습니다."
  echo "   먼저 npm login을 실행한 뒤 다시 시도하세요."
  exit 1
fi
echo "👤 npm user: $(npm whoami)"
npm publish --tag canary --access public

# 4-2. 원래 버전 복원
npm version "$CURRENT_VERSION" --no-git-tag-version
cd "$ROOT_DIR"

# 5. 완료 안내
echo "✅ Canary release completed!"
echo "🏷️  Published: ${FULL_PACKAGE_NAME}@${CANARY_VERSION}"
echo "📦 Install: pnpm add ${FULL_PACKAGE_NAME}@${CANARY_VERSION}"
echo "📦 Or tag:  pnpm add ${FULL_PACKAGE_NAME}@canary"
