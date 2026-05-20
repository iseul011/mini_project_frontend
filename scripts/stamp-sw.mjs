/**
 * 빌드마다 public/sw.js에 배포 ID를 박아 브라우저가 새 SW를 받도록 함.
 * (Vercel: VERCEL_GIT_COMMIT_SHA / VERCEL_DEPLOYMENT_ID)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(root, 'public', 'sw.js');
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  `dev-${Date.now()}`;

let content = fs.readFileSync(swPath, 'utf8');
if (content.includes('__BUILD_ID__')) {
  content = content.replaceAll('__BUILD_ID__', buildId);
} else {
  content = content.replace(/^\/\* build:.*\*\/\s*/m, '');
  content = `/* build: ${buildId} */\n${content}`;
}
fs.writeFileSync(swPath, content);

const envPath = path.join(root, '.env.build');
fs.writeFileSync(envPath, `NEXT_PUBLIC_BUILD_ID=${buildId}\n`);
console.log(`[stamp-sw] build id: ${buildId}`);
