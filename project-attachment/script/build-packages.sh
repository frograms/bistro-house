#!/bin/bash
# packages/* 가 비어 있어도 성공하는 패키지 빌드 헬퍼입니다.

set -e

shopt -s nullglob
package_jsons=(packages/*/package.json)
shopt -u nullglob

if [ ${#package_jsons[@]} -eq 0 ]; then
  echo "빌드할 packages/* 패키지가 없습니다."
  exit 0
fi

pnpm exec turbo run build --filter='./packages/*'
