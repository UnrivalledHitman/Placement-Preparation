// Builds the MySQL reference: content.js -> HTML -> PDF (Edge headless), two passes for TOC page numbers.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PDFTOTEXT = process.env.PDFTOTEXT;
const OUT = process.argv[2] || path.join(DIR, 'out.pdf');
const TITLE = 'MySQL Commands and Functions: A Practical Reference';
const blocks = require('./content.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Inline markup: `code`, **bold**, *italic*
function inline(s) {
  const parts = String(s).split(/(`[^`]*`)/);
  return parts.map(p => {
    if (p.startsWith('`') && p.endsWith('`') && p.length >= 2) return `<code>${esc(p.slice(1, -1))}</code>`;
    return esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  }).join('');
}

// ---------------------------------------------------------------- highlighting
const SQL_KW = new Set(`ADD AFTER ALL ALTER AND ANY AS ASC AUTO_INCREMENT BEGIN BETWEEN BY CALL CASCADE CASE CAST CHECK COLUMN COLUMNS
COMMIT CONSTRAINT CREATE CROSS CURSOR DATABASE DECLARE DEFAULT DELETE DELIMITER DESC DESCRIBE DETERMINISTIC DISTINCT DO DROP DUPLICATE EACH
ELSE ELSEIF END EXCEPT EXISTS FOR FOREIGN FROM FULL FUNCTION GRANT GROUP HAVING IF IGNORE IN INDEX INNER INSERT INTERSECT INTERVAL INTO
IS JOIN KEY LEFT LIKE LIMIT MODIFY NOT NULL OFFSET ON OR ORDER OUT OUTER OVER PARTITION PRIMARY PROCEDURE RECURSIVE REFERENCES RELEASE
RENAME REPLACE RETURN RETURNS RIGHT ROLLBACK ROLLUP ROW SAVEPOINT SELECT SET SHOW SIGNAL SQLSTATE START TABLE THEN TO TRANSACTION TRIGGER
TRUNCATE UNION UNIQUE UPDATE USE USING VALUES VIEW WHEN WHERE WHILE WINDOW WITH INT VARCHAR DECIMAL DATE DATETIME CHAR TEXT
BEFORE MESSAGE_TEXT DAY MONTH YEAR TRUE FALSE`.split(/\s+/));
const JAVA_KW = new Set(`import public class static void throws try new while if else return for int String final`.split(/\s+/));

function highlight(code, lang) {
  const kw = lang === 'java' ? JAVA_KW : SQL_KW;
  const re = lang === 'java'
    ? /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g
    : /(--[^\n]*)|('(?:''|\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(@?[A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g;
  let out = '', m;
  while ((m = re.exec(code))) {
    if (m[1]) out += `<span class="c">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="s">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="n">${esc(m[3])}</span>`;
    else if (m[4]) out += kw.has(m[4]) ? `<span class="k">${esc(m[4])}</span>` : esc(m[4]);
    else out += esc(m[5]);
  }
  return out;
}

// ---------------------------------------------------------------- mysql-client style tables
const isNum = v => typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v));
function ascii({ cols, rows, left = [], footer }) {
  const cell = v => (v === null ? 'NULL' : String(v));
  const w = cols.map((c, i) => Math.max(c.length, ...rows.map(r => cell(r[i]).length)));
  const right = cols.map((_, i) => !left.includes(i) && rows.every(r => r[i] === null || isNum(r[i])) && rows.some(r => r[i] !== null));
  const line = '+' + w.map(n => '-'.repeat(n + 2)).join('+') + '+';
  const fmt = (vals, header) => '| ' + vals.map((v, i) => {
    const s = cell(v);
    return !header && right[i] ? s.padStart(w[i]) : s.padEnd(w[i]);
  }).join(' | ') + ' |';
  const n = rows.length;
  return [line, fmt(cols, true), line, ...rows.map(r => fmt(r)), line,
    footer || (n === 1 ? '1 row in set' : `${n} rows in set`)].join('\n');
}

// ---------------------------------------------------------------- render
function render(pageMap) {
  const toc = [];
  let body = '';
  let sec = 0;
  for (const b of blocks) {
    const [type, a, c, d] = b;
    switch (type) {
      case 'intro':
      case 'part': {
        const id = 'sec' + (++sec);
        toc.push({ level: 1, text: a, id });
        body += `<section class="part"><h1 id="${id}">${inline(a)}</h1>${c ? `<p class="lede">${inline(c)}</p>` : ''}`;
        body += '</section>';
        break;
      }
      case 'h2': {
        const id = 'sec' + (++sec);
        toc.push({ level: 2, text: a, id });
        body += `<h2 id="${id}">${inline(a)}</h2>`;
        break;
      }
      case 'p': body += `<p>${inline(a)}</p>`; break;
      case 'table': {
        const widths = d ? `<colgroup>${d.map(x => `<col style="width:${x}%">`).join('')}</colgroup>` : '';
        body += `<table class="ref">${widths}<thead><tr>${a.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>`;
        body += c.map(r => `<tr>${r.map(x => `<td>${inline(x)}</td>`).join('')}</tr>`).join('');
        body += '</tbody></table>';
        break;
      }
      case 'sql': case 'java':
        body += `<pre class="code${a.split('\n').length <= 24 ? ' short' : ''}">${highlight(a, type)}</pre>`; break;
      case 'out': {
        const items = a.map(x => `<pre class="item">${esc(typeof x === 'string' ? x : ascii(x))}</pre>`);
        body += `<div class="out"><div class="label">OUTPUT</div>${items.join('')}</div>`;
        break;
      }
      case 'trap': body += `<div class="call trap"><strong>Exam trap.</strong> ${inline(a)}</div>`; break;
      case 'tip': body += `<div class="call tip"><strong>Tip.</strong> ${inline(a)}</div>`; break;
      case 'note': body += `<div class="call note"><strong>Note.</strong> ${inline(a)}</div>`; break;
      default: throw new Error('unknown block ' + type);
    }
  }

  const tocHtml = toc.map(t => `<div class="toc l${t.level}"><a href="#${t.id}"><span class="t">${inline(t.text)}</span><span class="dots"></span><span class="pg">${pageMap ? pageMap[t.id] : '00'}</span></a></div>`).join('');

  const cover = `
<section class="cover">
  <div class="band">
    <div class="kicker">REFERENCE · MYSQL 8</div>
    <div class="title">MySQL Commands and Functions: A Practical Reference</div>
    <div class="sub">The statements and functions you use most, with a worked example and its output for each</div>
  </div>
  <div class="cover-body">
    <table class="ref"><colgroup><col style="width:62%"><col style="width:38%"></colgroup>
      <thead><tr><th>What is inside</th><th>How to use it</th></tr></thead>
      <tbody>
        <tr><td>Parts 1–4: tables, constraints, changing data, SELECT, NULL handling, aggregation</td><td>Read once, then look up as needed</td></tr>
        <tr><td>Parts 5–7: joins, subqueries, set operations, CTEs, window functions</td><td>The core of interview SQL questions</td></tr>
        <tr><td>Parts 8–12: built-in functions, views, indexes, stored programs, transactions, JDBC</td><td>For projects and the TCS CPA exam</td></tr>
        <tr><td>Appendices: execution order, common comparisons, error codes</td><td>Check before an interview</td></tr>
      </tbody>
    </table>
    <p class="cover-note">Every example runs against one small sample database (set up on page ${pageMap ? pageMap.sec2 : '00'}), so you can type each query in and compare the output.</p>
  </div>
</section>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${TITLE}</title>
<style>${fs.readFileSync(path.join(DIR, 'style.css'), 'utf8')}</style></head>
<body>
${cover}
<section class="contents"><h1 class="toc-title">Contents</h1>${tocHtml}</section>
${body}
</body></html>`;
}

function printPdf(html, pdf) {
  const htmlPath = path.join(DIR, 'reference.html');
  fs.writeFileSync(htmlPath, html);
  execFileSync(EDGE, ['--headless', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
    `--user-data-dir=${path.join(DIR, 'edge-profile')}`, `--print-to-pdf=${pdf}`, 'file:///' + htmlPath.replace(/\\/g, '/')],
  { stdio: 'ignore' });
}

function findPages(pdf) {
  const txt = execFileSync(PDFTOTEXT, [pdf, '-'], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const pages = txt.split('\f').map(p => p.split('\n').map(l => l.trim()));
  const entries = [];
  let sec = 0;
  for (const [type, text] of blocks) if (['intro', 'part', 'h2'].includes(type)) entries.push({ id: 'sec' + (++sec), text });
  // Contents entries extract as merged lines, so an exact line match only hits real headings.
  let p = pages.findIndex(lines => lines.includes('Contents'));
  const map = {};
  for (const e of entries) {
    const plain = e.text.replace(/`/g, '');
    while (p < pages.length && !pages[p].includes(plain)) p++;
    if (p >= pages.length) throw new Error('heading not found: ' + plain);
    map[e.id] = p + 1;
  }
  return map;
}

const pass1 = path.join(DIR, 'pass1.pdf');
printPdf(render(null), pass1);
const map = findPages(pass1);
printPdf(render(map), OUT);
const check = findPages(OUT);
const moved = Object.keys(map).filter(k => map[k] !== check[k]);
console.log(moved.length ? 'WARNING: pages moved for ' + moved.join(', ') : 'TOC page numbers stable');
console.log(JSON.stringify(check));
