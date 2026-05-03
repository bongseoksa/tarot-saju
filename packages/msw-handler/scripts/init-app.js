#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 인자 파싱
const args = process.argv.slice(2);
const appName = args.find(arg => arg.startsWith('--'))?.replace('--', '');

if (!appName) {
  console.error('Error: App name is required. Usage: init:app --<app-name>');
  console.error('Example: init:app --channel');
  process.exit(1);
}

// 경로 설정 (packages/msw-handler 기준으로 ../../apps/${appName}/public)
const packageRoot = resolve(__dirname, '..');
const publicDir = resolve(packageRoot, `../../apps/${appName}/public`);
const workerFile = resolve(publicDir, 'mockServiceWorker.js');

// 파일이 이미 존재하는지 확인
const fileExists = existsSync(workerFile);
if (fileExists) {
  console.log(`[MSW] mockServiceWorker.js already exists at ${workerFile}`);
}

// msw init 실행 (yes 명령어로 자동 응답, 출력 필터링)
try {
  console.log(`[MSW] Initializing MSW worker for ${appName}...`);
  const output = execSync(`yes | msw init "${publicDir}" 2>&1`, {
    cwd: packageRoot,
    shell: '/bin/bash',
    encoding: 'utf8',
    env: { ...process.env }
  });
  
  // 중요한 메시지만 출력
  const lines = output.split('\n');
  const importantLines = lines.filter(line => 
    line.includes('Copying') || 
    line.includes('Successfully') || 
    line.includes('Worker script') ||
    line.includes('ERROR') ||
    line.includes('Error')
  );
  
  if (importantLines.length > 0) {
    importantLines.forEach(line => {
      if (line.trim()) console.log(line.trim());
    });
  }
  
  if (existsSync(workerFile)) {
    console.log(`[MSW] ✅ Successfully initialized at ${publicDir}`);
  } else {
    throw new Error('Worker file was not created');
  }
} catch (error) {
  if (existsSync(workerFile)) {
    console.log(`[MSW] ✅ Successfully initialized at ${publicDir}`);
  } else {
    console.error(`[MSW] ❌ Failed to initialize:`, error.message);
    process.exit(1);
  }
}

// build 실행 (파일이 이미 존재하거나 새로 생성된 경우)
const monorepoRoot = resolve(packageRoot, '../..');

// 패키지 설치 (워크스페이스 필터 기반)
console.log(`[MSW] Installing dependencies for @packages/msw-handler...`);
try {
  execSync('pnpm --filter @packages/msw-handler install', {
    cwd: monorepoRoot,
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log(`[MSW] ✅ Install completed`);
} catch (installError) {
  console.error(`[MSW] ⚠️  Install failed:`, installError.message);
  process.exit(1);
}

console.log(`[MSW] Building msw-handler...`);
try {
  execSync('pnpm run build', {
    cwd: packageRoot,
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log(`[MSW] ✅ Build completed`);
} catch (buildError) {
  console.error(`[MSW] ⚠️  Build failed:`, buildError.message);
  process.exit(1);
}

