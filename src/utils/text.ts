// 공공 API 가 제목·장소 등에 HTML 엔티티를 그대로 넣어 보낸다(예: "6&middot;25전쟁").
// 이중 인코딩("&amp;middot;")도 있어서 바뀌지 않을 때까지 몇 번 푼다.
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  middot: '·', bull: '•', hellip: '…', ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  times: '×', divide: '÷', deg: '°', plusmn: '±',
  larr: '←', rarr: '→', uarr: '↑', darr: '↓', harr: '↔',
  copy: '©', reg: '®', trade: '™', sim: '∼', tilde: '˜',
  star: '☆', starf: '★', hearts: '♥', cir: '○', squ: '□',
};

const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi;

function decodeOnce(str: string): string {
  return str.replace(ENTITY, (whole, name: string) => {
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X'
        ? parseInt(name.slice(2), 16)
        : parseInt(name.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return whole;
      try { return String.fromCodePoint(code); } catch { return whole; }
    }
    return NAMED[name.toLowerCase()] ?? whole;
  });
}

export function decodeHtmlEntities(str: string | null | undefined): string {
  if (!str) return '';
  let out = str;
  for (let i = 0; i < 3; i++) {
    const next = decodeOnce(out);
    if (next === out) break;
    out = next;
  }
  return out;
}
