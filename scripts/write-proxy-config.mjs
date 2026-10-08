/**
 * 금고의 키로 Cafe24 PHP 중계 설정 파일을 만든다(2026-10-07, 금고 원본 2026-10-08).
 *
 * 키 원본은 이 PC 의 공용 금고(C:/github/.secrets, 금고 이름 "art-finder/.env")다. 키를 바꾸면 금고만
 * 바꾸고 `npm run build` 하면 prebuild 로 이 스크립트가 돌아 public/*_config.php 가 갱신되고, 빌드
 * 결과(out/)에 따라 들어가 Cafe24 에 함께 올라간다. 금고를 못 열 때(다른 PC 등)나 금고에 없는 이름만
 * .env 값을 쓴다 - .env 값은 확인 뒤 지울 예비(C:/github/SECURITY-FOLLOWUPS.md 마지막 삭제 목록).
 * 만든 파일은 git 제외(.gitignore). 값이 비어 있으면 기존 파일을 건드리지 않는다.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function readEnv(file) {
  const values = {};
  if (!existsSync(file)) return values;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].replace(/\s+#.*$/, '').trim();
    if (value.length >= 2 && value[0] === value.at(-1) && `'"`.includes(value[0])) value = value.slice(1, -1);
    values[m[1]] = value;
  }
  return values;
}

async function readVault() {
  try {
    const { readSecrets } = await import('file:///C:/github/.secrets/load.mjs');
    return readSecrets(['art-finder/.env']);
  } catch (error) {
    console.warn(`[proxy-config] 금고를 열지 못해 .env 값으로 계속합니다: ${String(error.message).split('\n')[0]}`);
    return {};
  }
}

const fileEnv = readEnv(path.join(root, '.env'));
const vault = await readVault();
// 금고가 원본: 금고에 값이 있으면 그 값, 없을 때만 .env.
const env = { ...fileEnv, ...Object.fromEntries(Object.entries(vault).filter(([, v]) => v)) };
const phpString = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function write(file, names) {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) {
    console.warn(`[proxy-config] ${file} 건너뜀 — 금고·.env 에 값 없음: ${missing.join(', ')}`);
    return;
  }
  const body = [
    '<?php',
    '// 자동 생성(scripts/write-proxy-config.mjs) — 원본은 공용 금고. git 에 커밋하지 않는다.',
    ...names.map((n) => `define('${n}', ${phpString(env[n])});`),
    '',
  ].join('\n');
  writeFileSync(path.join(root, 'public', file), body);
  console.log(`[proxy-config] public/${file} 갱신 (${names.join(', ')})`);
}

write('naver_proxy_config.php', ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET']);
write('culture_proxy_config.php', ['CULTURE_API_KEY']);
