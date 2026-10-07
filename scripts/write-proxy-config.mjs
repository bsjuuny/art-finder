/**
 * .env 의 키로 Cafe24 PHP 중계 설정 파일을 만든다(2026-10-07).
 *
 * 키 원본은 .env 하나다. 키를 바꾸면 .env 만 고치고 `npm run build` 하면 prebuild 로 이 스크립트가 돌아
 * public/*_config.php 가 갱신되고, 빌드 결과(out/)에 따라 들어가 Cafe24 에 함께 올라간다.
 * 만든 파일은 git 제외(.gitignore). .env 에 값이 비어 있으면 기존 파일을 건드리지 않는다.
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

const env = readEnv(path.join(root, '.env'));
const phpString = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function write(file, names) {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) {
    console.warn(`[proxy-config] ${file} 건너뜀 — .env 에 값 없음: ${missing.join(', ')}`);
    return;
  }
  const body = [
    '<?php',
    '// 자동 생성(scripts/write-proxy-config.mjs) — 원본은 .env. git 에 커밋하지 않는다.',
    ...names.map((n) => `define('${n}', ${phpString(env[n])});`),
    '',
  ].join('\n');
  writeFileSync(path.join(root, 'public', file), body);
  console.log(`[proxy-config] public/${file} 갱신 (${names.join(', ')})`);
}

write('naver_proxy_config.php', ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET']);
