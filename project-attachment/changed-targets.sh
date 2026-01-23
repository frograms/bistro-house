#!/bin/bash
# 변경된 패키지를 반환합니다.

set +e
lerna changed --parseable | while read -r PACKAGE_PATH; do
  if [ -d "$PACKAGE_PATH" ]; then
    echo "$PACKAGE_PATH"
  fi
done
set -e