# Solutions
%Every program executed in Node.js or headless Chromium

## Part 1 solutions

### F1.1 Script loading

`a.js` (a classic script) runs first and **blocks** parsing while it downloads and runs. `b.js`, `c.js` and the module `d.js` are fetched in parallel without blocking, and run after parsing finishes, in document order (`b`, `c`, `d`; modules are deferred by default), and all before `DOMContentLoaded`. With `async`, a script runs as soon as it has downloaded, interrupting parsing briefly, in **whatever order** downloads finish, and possibly after `DOMContentLoaded`; use it only for independent scripts such as analytics.

```html run Checking the defer and module ordering
<script>window.log = []; document.addEventListener('DOMContentLoaded', () => {
  log.push('DOMContentLoaded'); console.log(log.join(' -> ')); });</script>
<script>log.push('a (classic)');</script>
<script defer src="data:text/javascript,log.push('b (defer)')"></script>
<script type="module">log.push('d (module)');</script>
<script defer src="data:text/javascript,log.push('c (defer)')"></script>
<p>body content</p>
<script>log.push('end of body (classic)');</script>
```

Deferred scripts and modules share one queue in document order, which is why `d (module)`, written between `b` and `c`, runs between them.

### F1.2 A sign-up form without a library

```html run Built-in validation plus one custom rule
<form id="f" novalidate>
  <label>Email <input id="email" type="email" required></label>
  <label>Password <input id="pw" type="password" required minlength="8"></label>
  <label>Confirm <input id="pw2" type="password" required></label>
</form>
<script>
  const [email, pw, pw2] = ['email', 'pw', 'pw2'].map(id => document.getElementById(id));
  const syncMatch = () =>
    pw2.setCustomValidity(pw2.value === pw.value ? '' : 'Passwords differ');
  pw.addEventListener('input', syncMatch); pw2.addEventListener('input', syncMatch);
  const fill = (e, p, p2) => {
    for (const [el, v] of [[email, e], [pw, p], [pw2, p2]]) {
      el.value = v; el.dispatchEvent(new Event('input'));
    }
    const report = [email, pw, pw2].map(el => `${el.id}:${el.checkValidity() ? 'ok' :
      el.validationMessage ? Object.keys(ValidityState.prototype)
        .filter(k => k !== 'valid' && el.validity[k])[0] : '?'}`);
    console.log(JSON.stringify([e, p, p2]), report.join(' '));
  };
  fill('priya@example', 'short', 'short');
  fill('priya@example.com', 'longenough', 'longenouhg');
  fill('priya@example.com', 'longenough', 'longenough');
</script>
```

`priya@example` is a **valid** email by the HTML standard (a host without a dot is allowed), a reminder that built-in checks are permissive. In the second attempt the mismatch shows up as `customError`. Note that `minlength` is only checked for text the **user** typed; a value set by script is not flagged as `tooShort`, which is why `short` passes the length check in the first attempt here. Server-side validation must enforce the real rules.

### F1.3 From div soup to semantics

```html run The rewrite, checked by axe
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Readings – MeterHub</title></head><body>
<header>
  <a href="/" aria-label="MeterHub home">MeterHub</a>
  <nav aria-label="Main"><ul><li><a href="/">Home</a></li><li><a href="/readings"
    aria-current="page">Readings</a></li></ul></nav>
</header>
<main><h1>Readings</h1><p>Latest readings for your meters.</p></main>
<footer><p>© MeterHub</p></footer>
<script src="lib/axe.js"></script>
<script>
  window.__ready = false;
  axe.run().then(r => {
    console.log('violations:', r.violations.length);
    window.__ready = true;
  });
</script>
</body></html>
```

Every clickable `div` became a link (navigation) and the title an `h1`; landmarks let screen-reader users jump straight to the navigation or the main content.

### F1.4 Render-blocking resources

| Resource | Blocks first paint? | Fix |
|---|---|---|
| 200 KB stylesheet | Yes (all CSS in the head is render-blocking) | Inline the small **critical CSS** for above-the-fold content; load the rest normally; split per route; remove unused CSS |
| Print stylesheet | Not if declared with `media="print"` (downloaded at low priority, never blocks screen rendering) | `<link rel="stylesheet" href="print.css" media="print">` |
| Web font | Text using it may be invisible for up to 3 s | `font-display: swap`; preload the main font; subset it |
| Synchronous analytics script in the head | Yes, it blocks parsing | `async` (independent) or `defer`; load after interaction |
| Image below the fold | No, but it competes for bandwidth with critical resources | `loading="lazy"`, correct size, modern format |

## Part 2 solutions

### F2.1 Specificity

| Selector | (IDs, classes, elements) |
|---|---|
| `#nav a` | (1, 0, 1) |
| `.menu a:hover` | (0, 2, 1) |
| `nav ul li a` | (0, 0, 4) |
| `a.active` | (0, 1, 1) |
| `[data-x] a` | (0, 1, 1) |
| `:is(#nav, .menu) a` | (1, 0, 1): `:is()` counts its most specific argument |

`#nav a` and `:is(#nav, .menu) a` tie on (1, 0, 1), so the one written **later** wins.

```html run Checking which rule wins
<style>
  #nav a { color: red; }
  .menu a:hover { color: green; }
  nav ul li a { color: blue; }
  a.active { color: orange; }
  :is(#nav, .menu) a { color: purple; }
</style>
<nav id="nav" class="menu"><ul><li><a class="active" href="#">Readings</a></li></ul></nav>
<script>
  console.log('computed colour:', getComputedStyle(document.querySelector('a')).color);
</script>
```

The result is purple, rgb(128, 0, 128): the `:is()` rule has the same specificity as `#nav a` and comes later. (`:hover` is not active because nothing is hovered.)

### F2.2 Centre it three ways

```html run Three centring techniques, measured
<style>
  .box { position: relative; width: 400px; height: 300px; margin-bottom: 8px;
         background: #f1f5f9; }
  .card { width: 200px; height: 100px; background: #2563eb; }
  #g { display: grid; place-items: center; }
  #f { display: flex; justify-content: center; align-items: center; }
  #a .card { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
</style>
<div class="box" id="g"><div class="card"></div></div>
<div class="box" id="f"><div class="card"></div></div>
<div class="box" id="a"><div class="card"></div></div>
<script>
  for (const id of ['g', 'f', 'a']) {
    const box = document.getElementById(id).getBoundingClientRect();
    const c = document.querySelector(`#${id} .card`).getBoundingClientRect();
    console.log(`${id}: left gap ${c.left - box.left}, right gap ${box.right - c.right}, ` +
                `top gap ${c.top - box.top}, bottom gap ${box.bottom - c.bottom}`);
  }
</script>
```

All three give gaps of 100 px on each side and 100 px above and below. Grid's `place-items: center` is the shortest; the absolute version also works when the card's size is unknown, because `translate(-50%, -50%)` uses the card's own size.

### F2.3 Holy-grail layout

```html run A responsive holy-grail layout at two widths
<style>
  body { margin: 0; }
  .page { display: grid; gap: 4px; min-height: 160px;
          grid-template: "head head head" auto "nav main aside" 1fr "foot foot foot" auto
                         / 120px 1fr 120px; }
  @media (max-width: 599px) {
    .page { grid-template: "head" "main" "nav" "aside" "foot" / 1fr; }
  }
  header { grid-area: head; } nav { grid-area: nav; } main { grid-area: main; }
  aside { grid-area: aside; } footer { grid-area: foot; }
</style>
<div class="page"><header>H</header><nav>N</nav><main>M</main><aside>A</aside>
  <footer>F</footer></div>
<iframe id="phone" style="width: 360px; height: 260px; border: 0"></iframe>
<script>
  const order = (doc) => [...doc.querySelectorAll('.page > *')]
    .map(e => [e.tagName[0], Math.round(e.getBoundingClientRect().top),
               Math.round(e.getBoundingClientRect().left)])
    .sort((x, y) => x[1] - y[1] || x[2] - y[2]).map(x => x[0]).join(' ');
  console.log('720 px, reading order by position:', order(document));
  const phone = document.getElementById('phone');
  const page = document.documentElement.outerHTML;
  phone.srcdoc = page.replace(/<iframe[\s\S]*$/, '</body></html>');
  phone.onload = () => console.log('360 px, reading order by position:',
                                   order(phone.contentDocument));
</script>
```

At 720 px the nav, main and aside share the middle row; below 600 px they stack with main before nav. Changing the **visual** order with CSS does not change the DOM order that keyboard and screen-reader users follow, so keep the DOM order sensible (here main is announced after nav either way).

### F2.4 A gallery without media queries

With `repeat(auto-fill, minmax(180px, 1fr))` and a 12 px gap, n columns fit when n × 180 + (n − 1) × 12 ≤ the container width. With 16 px body margins, the container is the viewport minus 32 px.

```html run Counting columns at three viewport widths
<style>
  .g { display: grid; gap: 12px;
       grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
  .g div { height: 20px; background: #c7d2fe; }
</style>
<div class="g"><div></div><div></div><div></div><div></div><div></div><div></div></div>
<script>
  const page = document.documentElement.outerHTML;
  const html = page.replace(/<script[\s\S]*$/, '</body></html>');
  for (const w of [360, 720, 1100]) {
    const f = document.createElement('iframe');
    f.style.cssText = `width:${w}px;height:80px;border:0`;
    f.srcdoc = html;
    f.onload = () => {
      const cols = getComputedStyle(f.contentDocument.querySelector('.g'))
        .gridTemplateColumns.split(' ');
      console.log(`${w} px: ${cols.length} columns of ${parseFloat(cols[0]).toFixed(1)} px`);
    };
    document.body.append(f);
  }
  window.__ready = false; setTimeout(() => { window.__ready = true; }, 400);
</script>
```

At 360 px: 328 px available, one column (two would need 372). At 720 px: 688 px, three columns (3 × 180 + 24 = 564 ≤ 688; four need 756). At 1100 px: 1068 px, five columns (5 × 180 + 48 = 948 ≤ 1068; six need 1140). The `1fr` maximum stretches the columns to fill the leftover space.

### F2.5 The modal behind the header

`transform` (also `opacity < 1`, `filter`, `will-change`, or `position` + `z-index`) makes the container a **stacking context**. Its `z-index: 1` places the whole context, with everything inside it, below the header's `z-index: 10`; the modal's 9999 only orders it **within** that context.

```html run Proving which element is on top, before and after the fix
<style>
  header { position: sticky; top: 0; height: 60px; background: #1e293b; z-index: 10; }
  .container { position: relative; z-index: 1; transform: translateZ(0); }
  .modal { position: fixed; top: 20px; left: 20px; width: 200px; height: 100px;
           background: #f59e0b; z-index: 9999; }
</style>
<header id="header"></header>
<div class="container" id="container"><div class="modal" id="modal"></div></div>
<script>
  const onTop = () => document.elementFromPoint(50, 40).id;
  console.log('inside the transformed container, on top at (50, 40):', onTop());
  document.body.append(document.getElementById('modal'));     // fix: render as a body child
  console.log('moved to <body> (a "portal"), on top at (50, 40):', onTop());
</script>
```

The standard fix is to render overlays at the end of `<body>` (React's `createPortal`, or the native `<dialog>`, which uses the browser's **top layer** above everything); the alternative is removing the `transform` or `z-index` from the container.

### F2.6 Truncation

```html run Ellipsis on one line, clamp to two lines, and detecting truncation
<style>
  .name { width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .desc { width: 220px; line-height: 20px; display: -webkit-box; -webkit-box-orient: vertical;
          -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
</style>
<div class="name" id="n1">SM-42 Kolkata Salt Lake Sector V Block GP Main Feeder</div>
<div class="name" id="n2">SM-7 Pune</div>
<div class="desc" id="d1">This meter reports every fifteen minutes and has shown a steady
  increase in evening demand over the last three weeks, mostly between six and nine.</div>
<script>
  for (const el of document.querySelectorAll('.name'))
    console.log(`${el.id}: truncated = ${el.scrollWidth > el.clientWidth}` +
                (el.scrollWidth > el.clientWidth ? ` (title tooltip set)` : ''));
  const d = document.getElementById('d1');
  console.log(`d1: ${d.clientHeight / 20} visible lines, ` +
              `truncated = ${d.scrollHeight > d.clientHeight}`);
  document.querySelectorAll('.name, .desc').forEach(el => {
    if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
      el.title = el.textContent.trim();
  });
</script>
```

Setting the full text as a `title` (or a proper tooltip) only when truncated keeps the information reachable without cluttering short names.

## Part 3 solutions

### F3.1 Fix a palette

```js run Checking contrast and darkening each colour until it passes AA
const channels = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const lum = hex => channels(hex).map(c => c / 255)
  .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};
const darken = (hex, f) =>
  '#' + channels(hex).map(c => Math.round(c * f).toString(16).padStart(2, '0')).join('');
// [colour to adjust, the fixed colour it sits with, label]
const cases = [['#8a94a6', '#ffffff', 'secondary text on white'],
               ['#3b82f6', '#ffffff', 'link on white'],
               ['#22c55e', '#ffffff', 'green badge behind white text']];
for (const [colour, other, name] of cases) {
  const r = ratio(colour, other);
  let line = `${name}: ${r.toFixed(2)}:1 ${r >= 4.5 ? 'passes' : 'fails'}`;
  let f = 1;
  while (ratio(darken(colour, f), other) < 4.5) f -= 0.01;  // same hue, darker
  const fixed = darken(colour, f);
  if (f < 1) line += ` -> ${fixed} (${ratio(fixed, other).toFixed(2)}:1)`;
  console.log(line);
}
```

All three fail. Darkening while keeping the hue gives the lightest passing shades shown. Design systems avoid this problem by defining each colour as a numbered scale (50–900) with known contrast against white and black, and allowing only passing combinations for text.

### F3.2 States of a table

- **Loading** (first load): skeleton rows with the final column widths; header and controls visible.
- **Refreshing** (data already shown): keep the rows, show a small spinner, avoid layout shifts.
- **Empty** (no meters at all): explanation and an "Add meter" button.
- **No results** (search or filter matched nothing): "No meters match 'xyz'" with a "Clear search" action; different from empty.
- **Error** loading: what failed in plain words, a Retry button; on refresh failure keep stale data with a warning.
- **Partial**: some columns failed (forecast unavailable) shown as "—" with a tooltip.
- **Long content**: truncated names with tooltips; numbers right-aligned with tabular figures; pagination or virtualisation for thousands of rows; sticky header.
- **Pagination states**: first and last page (disable buttons), page out of range after deletions.
- **Row states**: hover, keyboard focus, selected (with a checkbox), disabled (meters being migrated).
- **Delete flow**: confirmation dialog naming the meter; in-progress (button disabled, spinner); success (toast with **Undo**); failure (error message, row restored).
- **Permissions**: a read-only user sees no delete buttons (and the server enforces it anyway).
- **Responsive**: on phones, rows become cards or the table scrolls horizontally with the first column pinned.

### F3.3 A type scale

16 × 1.2<sup>k</sup> for k = −2 … 4: 11.1, 13.3, 16, 19.2, 23.0, 27.6, 33.2, rounding to **11, 13, 16, 19, 23, 28, 33 px**. A scale gives sizes that relate to each other in a consistent rhythm, limits choices to a handful (so the same level of heading looks the same everywhere), and lets you change the whole hierarchy by changing two numbers. 11 px is too small for body text; reserve it for rare labels, or drop the bottom step.

## Part 4 solutions

### F4.1 Predict the output

```js run Coercion results
import { inspect } from 'node:util';
const exprs = {
  '[] == false': [] == false, 'null + 1': null + 1, 'undefined + 1': undefined + 1,
  "'3' - '2'": '3' - '2', "'3' + 2 - 1": '3' + 2 - 1, '[1, 2] + [3]': [1, 2] + [3],
  'typeof NaN': typeof NaN, '0.1 * 3': 0.1 * 3, '[10, 1, 3].sort()': [10, 1, 3].sort(),
  "!!'false'": !!'false',
};
for (const [k, v] of Object.entries(exprs)) console.log(k.padEnd(18), '->', inspect(v));
```

`[] == false` is true because both sides become the number 0 (`[]` → `''` → 0). `null` becomes 0 in arithmetic but `undefined` becomes `NaN`. `'3' + 2` concatenates to `'32'`, then `- 1` converts back to a number. Arrays added together are converted to strings. `NaN` is of type number. Any non-empty string, including `'false'`, is truthy.

### F4.2 Memoise

```js run Memoising a recursive function
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}
let calls = 0;
const slowFib = n => { calls++; return n < 2 ? n : slowFib(n - 1) + slowFib(n - 2); };
console.log('slow fib(25) =', slowFib(25), 'with', calls.toLocaleString('en-IN'), 'calls');
calls = 0;
const fastFib = memoize(n => {
  calls++; return n < 2 ? n : fastFib(n - 1) + fastFib(n - 2);
});
console.log('memoised fib(25) =', fastFib(25), 'with', calls, 'calls');
calls = 0; fastFib(30);
console.log('then fib(30) needs only', calls, 'new calls');
```

The recursion must go through the **memoised** name (`fastFib`); memoising only the outer call would cache just the final answer. Use memoisation only for **pure** functions, and bound the cache (an LRU) in long-running apps.

### F4.3 Event-loop puzzle

```js run Predict, then check
console.log('A sync');
setTimeout(() => {
  console.log('F timeout 1');
  Promise.resolve().then(() => console.log('G microtask inside timeout 1'));
}, 0);
setTimeout(() => console.log('H timeout 2'), 0);
Promise.resolve().then(() => {
  console.log('C microtask 1');
  setTimeout(() => console.log('I timeout scheduled by a microtask'), 0);
  queueMicrotask(() => console.log('E microtask queued by a microtask'));
});
(async () => { console.log('B async start'); await 0; console.log('D after await'); })();
console.log('B2 sync end');
```

Synchronous code first (A, B, B2). Then every microtask, including ones queued while draining (C, D, E). Then tasks in order: timeout 1 (F), and **before** timeout 2 the microtask it queued (G), then H, and finally I, which was scheduled last.

### F4.4 Promise.all from scratch

```js run A spec-like promiseAll
function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = [...iterable];
    const results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);
    items.forEach((item, i) => {
      Promise.resolve(item).then(value => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject);                                      // the first rejection wins
    });
  });
}
const later = (ms, v, fail) =>
  new Promise((res, rej) => setTimeout(() => (fail ? rej(v) : res(v)), ms));
console.log(await promiseAll([later(30, 'slow'), later(10, 'fast'), 42]));
console.log(await promiseAll([]));
try { await promiseAll([later(30, 'a'), later(10, 'boom', true)]); }
catch (e) { console.log('rejected with:', e); }
console.log('matches the built-in:', JSON.stringify(await Promise.all([later(5, 1), 2])) ===
            JSON.stringify(await promiseAll([later(5, 1), 2])));
```

Results are stored by **index**, not in completion order; plain values are wrapped with `Promise.resolve`; once rejected, later settlements are ignored because a promise can settle only once.

### F4.5 A resilient fetch

```js run fetchWithRetry against a server that fails twice
import http from 'node:http';
let hits = 0;
const server = http.createServer((req, res) => {
  hits++;
  if (req.url === '/flaky' && hits <= 2) { res.writeHead(503); return res.end(); }
  if (req.url === '/hang') return;                          // never answers
  if (req.url === '/missing') { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}');
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function fetchWithRetry(url, opts = {}) {
  const { retries = 3, timeoutMs = 200, baseDelay = 20, log } = opts;
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (res.status < 500) return res;                     // success or a client error: stop
      if (attempt >= retries) return res;
      log?.(`attempt ${attempt + 1}: HTTP ${res.status}, retrying`);
    } catch (e) {
      if (attempt >= retries) throw e;
      log?.(`attempt ${attempt + 1}: ${e.name}, retrying`);
    } finally { clearTimeout(timer); }
    await sleep(baseDelay * 2 ** attempt);
  }
}
const r1 = await fetchWithRetry(base + '/flaky', { log: console.log });
console.log('flaky ->', r1.status, await r1.json());
const r2 = await fetchWithRetry(base + '/missing', { log: console.log });
console.log('missing -> status', r2.status, '(4xx is not retried)');
try {
  await fetchWithRetry(base + '/hang', { retries: 1, timeoutMs: 100, log: console.log });
}
catch (e) { console.log('hang -> gave up with', e.name); }
server.closeAllConnections(); server.close();
```

Only transient failures (timeouts, network errors, 5xx) are retried; a 404 or 400 will not change on retry. Add random **jitter** to the delay in real clients, and make sure the operation is **idempotent** (a GET, or a POST with an idempotency key) before retrying it.

### F4.6 Copies and equality

```js run Shallow versus deep copies, and a deepEqual
import { inspect } from 'node:util';
const meter = { id: 'SM-1', tags: ['home'], last: { kwh: 3 } };
const shallow = { ...meter };
const deep = structuredClone(meter);
shallow.tags.push('solar'); deep.last.kwh = 99;
console.log('original after editing the copies:', JSON.stringify(meter));
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length
    && ka.every(k => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
}
const tests = [[{ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }],
               [{ a: 1 }, { a: 1, b: undefined }],
               [[1, 2], { 0: 1, 1: 2 }], [NaN, NaN], [{ x: 0 }, { x: -0 }]];
const show = v => inspect(v, { breakLength: Infinity });
for (const [x, y] of tests) console.log(show(x), 'vs', show(y), '->', deepEqual(x, y));
```

The spread copied the top level only, so pushing to `shallow.tags` changed the original's array too; `structuredClone` copied everything. The last case shows a choice: `Object.is` treats `0` and `-0` as different (and `NaN` as equal to itself), which is what React uses to decide whether state changed.

### F4.7 An event emitter

```js run An EventEmitter with on, off, once and emit
class Emitter {
  #handlers = new Map();
  #list(type) { return this.#handlers.get(type) ?? []; }
  on(type, fn) {
    this.#handlers.set(type, [...this.#list(type), fn]);
    return () => this.off(type, fn);
  }
  off(type, fn) {
    this.#handlers.set(type, this.#list(type).filter(h => h !== fn && h.original !== fn));
  }
  once(type, fn) {
    const wrap = (...a) => { this.off(type, wrap); fn(...a); };
    wrap.original = fn;
    return this.on(type, wrap);
  }
  emit(type, ...args) {
    for (const h of [...this.#list(type)]) h(...args);      // a copy: safe to off() inside
    return this.#list(type).length;
  }
}
const bus = new Emitter();
const log = (...a) => console.log(...a);
const unsubscribe = bus.on('reading', (id, kwh) => log('logger:', id, kwh));
bus.once('reading', id => log('first-reading alert for', id));
bus.on('reading', function selfRemoving(id) {
  log('self-removing saw', id);
  bus.off('reading', selfRemoving);
});
console.log('listeners after emit 1:', bus.emit('reading', 'SM-1', 3.5));
console.log('listeners after emit 2:', bus.emit('reading', 'SM-2', 1.2));
unsubscribe();
console.log('listeners after unsubscribe + emit 3:', bus.emit('reading', 'SM-3', 0));
```

Copying the handler list before the loop makes removal during `emit` safe: every handler registered at the moment of `emit` runs exactly once, and removals take effect from the next `emit`. Returning an unsubscribe function from `on` is the pattern React effects expect for cleanup.
