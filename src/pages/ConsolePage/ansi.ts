const ANSI_RE = /\x1b\[([0-9;]*)m/g;

const FG: Record<number, string> = {
  30: '#000', 31: '#c33', 32: '#0a0', 33: '#990', 34: '#00c',
  35: '#c0c', 36: '#0cc', 37: '#ccc', 90: '#555', 91: '#f55',
  92: '#5f5', 93: '#ff5', 94: '#55f', 95: '#f5f', 96: '#5ff', 97: '#fff',
};
const BG: Record<number, string> = {
  40: '#000', 41: '#c33', 42: '#0a0', 43: '#990', 44: '#00c',
  45: '#c0c', 46: '#0cc', 47: '#ccc', 100: '#555', 101: '#f55',
  102: '#5f5', 103: '#ff5', 104: '#55f', 105: '#f5f', 106: '#5ff', 107: '#fff',
};

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function ansiToHtml(text: string): string {
  if (!text.includes('\x1b')) return escape(text);

  let bold = false, italic = false, underline = false;
  let fg: string | null = null, bg: string | null = null;
  let result = '';
  let last = 0;

  function openSpan(): string {
    const parts: string[] = [];
    if (fg) parts.push(`color:${fg}`);
    if (bg) parts.push(`background:${bg}`);
    if (bold) parts.push('font-weight:bold');
    if (italic) parts.push('font-style:italic');
    if (underline) parts.push('text-decoration:underline');
    return parts.length ? `<span style="${parts.join(';')}">` : '';
  }

  let open = false;
  for (const m of text.matchAll(ANSI_RE)) {
    result += escape(text.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;

    if (open) { result += '</span>'; open = false; }

    const codes = m[1] ? m[1].split(';').map(Number) : [0];
    for (const c of codes) {
      if (c === 0) { bold = italic = underline = false; fg = bg = null; }
      else if (c === 1) bold = true;
      else if (c === 3) italic = true;
      else if (c === 4) underline = true;
      else if (c in FG) fg = FG[c];
      else if (c in BG) bg = BG[c];
    }

    const span = openSpan();
    if (span) { result += span; open = true; }
  }

  result += escape(text.slice(last));
  if (open) result += '</span>';
  return result;
}
