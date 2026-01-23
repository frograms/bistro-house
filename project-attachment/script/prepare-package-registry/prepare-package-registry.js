#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 스크립트 디렉토리 경로
const scriptDir = __dirname;
const templatePath = path.join(scriptDir, 'package-template.json');

// 인자 파싱
const args = process.argv.slice(2);
const packageName = args[0];

if (!packageName) {
  console.error('Usage: node prepare-package-registry.js <package-name>');
  console.error('Example: node prepare-package-registry.js my-package');
  process.exit(1);
}

// 패키지 이름이 @watcha-authentic 스코프를 포함하는지 확인
const fullPackageName = packageName.startsWith('@watcha-authentic/')
  ? packageName
  : `@watcha-authentic/${packageName}`;

// 임시 디렉토리 생성
const tempDir = path.join(scriptDir, 'temp-package');
const packageJsonPath = path.join(tempDir, 'package.json');

try {
  // 기존 임시 디렉토리 정리
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  // 템플릿 읽기
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  // package.json 생성
  const packageJson = {
    ...template,
    name: fullPackageName,
    version: '0.0.1',
  };
  
  // description 필드 제거 (나중에 수동으로 추가)
  delete packageJson.description;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`\n📦 Creating empty package: ${fullPackageName}`);
  console.log(`📄 Version: ${packageJson.version}\n`);

  // npm publish 실행
  console.log('🚀 Publishing to npm registry...\n');
  process.chdir(tempDir);
  
  try {
    execSync('npm publish --access public', {
      stdio: 'inherit',
      env: {
        ...process.env,
        // npm 레지스트리 설정 확인
        NPM_CONFIG_REGISTRY: process.env.NPM_CONFIG_REGISTRY || 'https://registry.npmjs.org/',
      },
    });
    
    console.log(`\n✅ Successfully published ${fullPackageName} to npm!`);
  } catch (error) {
    console.error(`\n❌ Failed to publish ${fullPackageName}`);
    console.error('Make sure you are logged in to npm: npm login');
    throw error;
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} finally {
  // 임시 디렉토리 정리
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('\n🧹 Cleaned up temporary files');
  }
}

