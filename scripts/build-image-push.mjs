#!/usr/bin/env node
// Build Docker image แบบ multi-platform แล้ว push ขึ้น ghcr.io
// ใช้: npm run build:image:push v1.0.0
//
// ตัวแปรที่ตั้งได้:
//   IMAGE_NAME  (ค่าเริ่มต้น ghcr.io/sarunyu-d-commits/69-s3-app)
//   PLATFORMS   (ค่าเริ่มต้น linux/amd64,linux/arm64)
//   GHCR_USER / GHCR_TOKEN  ถ้าตั้งไว้ จะ login ให้อัตโนมัติ (ไม่ตั้ง = ต้อง docker login เองก่อน)
//   NO_LATEST=1  ไม่ติด tag latest

import { spawnSync } from 'node:child_process';

const IMAGE = (process.env.IMAGE_NAME || 'ghcr.io/sarunyu-d-commits/69-s3-app').toLowerCase();
const PLATFORMS = process.env.PLATFORMS || 'linux/amd64,linux/arm64';
const BUILDER = 'multiarch';
const version = process.argv[2];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (r.error) {
    console.error(`❌ รัน ${cmd} ไม่ได้: ${r.error.message}`);
    process.exit(1);
  }
  return r.status ?? 1;
}

function must(cmd, args, opts) {
  const code = run(cmd, args, opts);
  if (code !== 0) {
    console.error(`❌ คำสั่งล้มเหลว: ${cmd} ${args.join(' ')}`);
    process.exit(code);
  }
}

if (!version) {
  console.error('❌ ต้องระบุ version เช่น: npm run build:image:push v1.0.0');
  process.exit(1);
}
if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/.test(version)) {
  console.error(`❌ tag "${version}" ไม่ถูกต้อง (ใช้ได้แค่ A-Z a-z 0-9 _ . -)`);
  process.exit(1);
}

const tags = [version];
if (!process.env.NO_LATEST) tags.push('latest');

console.log(`📦 Image     : ${IMAGE}`);
console.log(`🏷️  Tags      : ${tags.join(', ')}`);
console.log(`🖥️  Platforms : ${PLATFORMS}\n`);

// 1) login (ถ้ามี token)
if (process.env.GHCR_TOKEN) {
  const user = process.env.GHCR_USER || 'sarunyu-d-commits';
  must('docker', ['login', 'ghcr.io', '-u', user, '--password-stdin'], {
    input: process.env.GHCR_TOKEN,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
}

// 2) builder แบบ docker-container (จำเป็นสำหรับ multi-platform)
const hasBuilder = spawnSync('docker', ['buildx', 'inspect', BUILDER], { stdio: 'ignore' }).status === 0;
if (!hasBuilder) {
  console.log(`🔧 สร้าง buildx builder "${BUILDER}"`);
  must('docker', ['buildx', 'create', '--name', BUILDER, '--driver', 'docker-container', '--bootstrap']);
}

// 3) build + push
const args = [
  'buildx', 'build',
  '--builder', BUILDER,
  '--platform', PLATFORMS,
  ...tags.flatMap((t) => ['-t', `${IMAGE}:${t}`]),
  '--label', 'org.opencontainers.image.source=https://github.com/sarunyu-d-commits/69-S3-app',
  '--label', `org.opencontainers.image.version=${version}`,
  '--push',
  '.',
];
must('docker', args);

console.log('\n✅ Push สำเร็จ:');
tags.forEach((t) => console.log(`   ${IMAGE}:${t}`));
