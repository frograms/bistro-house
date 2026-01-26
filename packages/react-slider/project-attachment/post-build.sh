#!/bin/bash
set -e

echo "Post build 스크립트가 실행 됩니다."

bash ./project-attachment/copy-dts.sh
bash ./project-attachment/fix-import.sh
bash ./project-attachment/collect-dist-styles.sh

echo "✅ Post build 스크립트가 실행 완료 되었습니다."
