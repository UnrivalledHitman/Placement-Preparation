# Chapter 5: JavaScript
%Values and types, scope and closures, this, prototypes, the event loop and promises

## 5.1 Values, types and the equality traps

JavaScript has seven primitive types (`string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`) and **objects** (including arrays and functions). Primitives are compared and copied by value; objects by **reference**. Variables are declared with `const` (cannot be reassigned; the default choice) or `let`; avoid the old `var` (function-scoped and hoisted).

```js run Types, references and the traps interviewers ask about
console.log(typeof 42, typeof 'x', typeof null, typeof [], typeof (() => 1), typeof 10n);
console.log('0.1 + 0.2 =', 0.1 + 0.2, '| equal to 0.3?', 0.1 + 0.2 === 0.3);
console.log('largest safe integer:', Number.MAX_SAFE_INTEGER, '| +1 +2:',
            Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);
console.log('== coerces:', 0 == '', '0' == false, null == undefined,
            '| === does not:', 0 === '');
console.log('NaN === NaN:', NaN === NaN, '| Number.isNaN(NaN):', Number.isNaN(NaN));
console.log('[] + {} =', JSON.stringify([] + {}), '| "5" * 2 =', '5' * 2,
            '| "5" + 2 =', '5' + 2);
const a = { kwh: 1 }; const b = a; b.kwh = 99;
console.log('objects are shared by reference: a.kwh =', a.kwh);
const c = structuredClone(a); c.kwh = 5;
console.log('after structuredClone, a.kwh =', a.kwh, ', c.kwh =', c.kwh);
const frozen = Object.freeze({ id: 1 });
console.log('const binding is not immutability; frozen object:', Object.isFrozen(frozen));
console.log('falsy values:', [0, '', null, undefined, NaN, false].map(Boolean).join(','));
```

Rules: always use `===`; never compare floats for exact equality (use a tolerance or integer paise/cents for money); `typeof null` being `"object"` is a 1995 bug kept for compatibility.

## 5.2 Scope, hoisting and closures

`let` and `const` are **block-scoped** (`{ ... }`); `var` is function-scoped and **hoisted** (usable before its line, as `undefined`). A **closure** is a function together with the variables of the scope where it was created; it keeps them alive after that scope has finished. Closures give private state, factories, and callbacks that remember context.

```js run Closures: private state, and the classic loop bug
function makeCounter() {
  let count = 0;                         // private: only the returned functions can reach it
  return { inc: () => ++count, get: () => count };
}
const c1 = makeCounter(), c2 = makeCounter();
c1.inc(); c1.inc(); c2.inc();
console.log('c1:', c1.get(), 'c2:', c2.get(), '| count is not visible:', typeof count);

const withVar = [], withLet = [];
for (var i = 0; i < 3; i++) withVar.push(() => i);
for (let j = 0; j < 3; j++) withLet.push(() => j);
console.log('var in loop:', withVar.map(f => f()), '| let in loop:', withLet.map(f => f()));

console.log('hoisted var before its line:', typeof hoisted);
var hoisted = 1;
try { console.log(notYet); let notYet = 2; }
catch (e) { console.log('let before its line:', e.name); }
```

With `var`, all three closures share one `i`, which is 3 when they run; `let` creates a fresh binding per iteration. Accessing a `let` variable before its declaration throws (the "temporal dead zone").

## 5.3 this, arrow functions and classes

`this` is decided by **how a function is called**, not where it is written: `obj.method()` → `obj`; a plain call `f()` → `undefined` in strict mode (modules are strict); `new F()` → the new object; `f.call(x)` → `x`. **Arrow functions** have no `this` of their own: they use the `this` of the surrounding code, which is why they are ideal for callbacks inside methods.

```js run this depends on the call site; arrow functions capture it
class Meter {
  constructor(id) { this.id = id; this.readings = []; }
  add(kwh) { this.readings.push(kwh); return this; }       // returning this allows chaining
  total() { return this.readings.reduce((s, x) => s + x, 0); }
  reportLater() { return () => `${this.id}: ${this.total()} kWh`; }  // arrow keeps this
  reportBroken() { return function () { return this?.id; }; }       // plain function loses it
}
const m = new Meter('SM-42').add(3.5).add(1.5);
console.log(m.reportLater()(), '|', String(m.reportBroken()()));
const detached = m.total;
try { detached(); } catch (e) { console.log('detached method:', e.constructor.name); }
console.log('bound:', m.total.bind(m)());
console.log('class is a function with a prototype:', typeof Meter,
            Object.getPrototypeOf(m) === Meter.prototype);
```

Classes are syntax over **prototypes**: methods live once on `Meter.prototype`, and each object links to it. A property lookup walks this **prototype chain** until it finds the name or reaches `null`.

## 5.4 Working with arrays and objects

| Need | Method |
|---|---|
| Transform each item | `map` |
| Keep some items | `filter` |
| Combine into one value | `reduce` |
| Find one | `find`, `findIndex`, `some`, `every`, `includes` |
| Sort without mutating | `toSorted((a, b) => a - b)` (`sort` mutates and compares as **strings** by default) |
| Group | `Object.groupBy(items, fn)` |
| Copy, merge | spread `[...a, x]`, `{ ...obj, kwh: 5 }` |
| Pull out fields | destructuring `const { id, kwh = 0 } = reading` |
| Safe access | optional chaining `user?.address?.city`, nullish default `x ?? 'n/a'` |

```js run Answering questions about readings with array methods
const readings = [
  { meter: 'SM-1', city: 'Kolkata', kwh: 12.5 }, { meter: 'SM-2', city: 'Pune', kwh: 8 },
  { meter: 'SM-3', city: 'Kolkata', kwh: 20 },   { meter: 'SM-4', city: 'Pune', kwh: 3.5 },
  { meter: 'SM-5', city: 'Delhi', kwh: 15 },
];
console.log('over 10 kWh:', readings.filter(r => r.kwh > 10).map(r => r.meter));
console.log('total:', readings.reduce((s, r) => s + r.kwh, 0));
const byCity = Object.groupBy(readings, r => r.city);
for (const [city, rs] of Object.entries(byCity))
  console.log(`${city}: ${rs.length} meters, ${rs.reduce((s, r) => s + r.kwh, 0)} kWh`);
console.log('default sort is by string:', [10, 9, 1, 100].sort(), '| numeric:',
            [10, 9, 1, 100].toSorted((x, y) => x - y));
const { meter, kwh, unit = 'kWh' } = readings[0];
console.log(meter, kwh, unit, '| optional chaining:',
            readings[9]?.meter ?? 'no such reading');
```

## 5.5 The event loop

JavaScript runs your code on **one thread**. Long-running work (a timer, a network request, a file read) is handed to the browser or Node, and its callback is queued for later. The **event loop** repeats: run the current task to completion; then run **all** queued **microtasks** (promise callbacks, `queueMicrotask`, `await` continuations); then let the browser render; then take the next **task** (timers, I/O, user events).

```js run Predict the order: synchronous code, microtasks, then tasks
console.log('1 script start');
setTimeout(() => console.log('8 setTimeout 0 (a task)'), 0);
Promise.resolve().then(() => console.log('4 first then (microtask)'))
                 .then(() => console.log('7 second then: queued only when the first ran'));
queueMicrotask(() => console.log('5 queueMicrotask'));
(async () => {
  console.log('2 async function body runs synchronously until the first await');
  await null;
  console.log('6 after await (microtask)');
})();
console.log('3 script end');
```

Output order: all synchronous lines, then microtasks in the order they were **queued**, and only then the timer, even with a 0 ms delay. The second `.then` comes after the `await` continuation because it is queued only when the first `.then` callback has run, by which time the other two microtasks are already waiting. Consequences: a long synchronous loop freezes the page (no rendering, no clicks) however the work is split into promises; break heavy work into tasks (`setTimeout`, `scheduler.yield()`) or move it to a **Web Worker**.

```js run A blocking loop delays a 10 ms timer
const start = performance.now();
setTimeout(() => console.log(`timer asked for 10 ms, ran after ${
  Math.round((performance.now() - start) / 100) * 100} ms (rounded)`), 10);
while (performance.now() - start < 300) {}   // 300 ms of synchronous work
console.log('busy loop finished');
```

## 5.6 Promises and async/await

A **promise** represents a value that will exist later: pending, then fulfilled or rejected. `async` functions return promises, and `await` pauses the function (not the thread) until a promise settles. Errors become rejections and are caught with `try/catch` around `await`.

| Combinator | Resolves when |
|---|---|
| `Promise.all([...])` | All fulfil (rejects on the first rejection) |
| `Promise.allSettled([...])` | All settle; gives each outcome |
| `Promise.race([...])` | The first settles (useful for timeouts) |
| `Promise.any([...])` | The first fulfils |

```js run Sequential versus parallel awaits, timeouts and error handling
const sleep = (ms, v, fail) => new Promise((res, rej) =>
  setTimeout(() => (fail ? rej(new Error(`${v} failed`)) : res(v)), ms));
const time = async (label, fn) => {
  const t = performance.now(); const r = await fn();
  const ms = Math.round((performance.now() - t) / 50) * 50;
  console.log(`${label}: ${JSON.stringify(r)} in ~${ms} ms`);
};
await time('sequential', async () =>
  [await sleep(200, 'meters'), await sleep(200, 'forecast')]);
await time('parallel  ', () => Promise.all([sleep(200, 'meters'), sleep(200, 'forecast')]));
await time('allSettled', async () =>
  (await Promise.allSettled([sleep(50, 'a'), sleep(50, 'b', true)])).map(r => r.status));
const withTimeout = (p, ms) =>
  Promise.race([p, sleep(ms).then(() => { throw new Error('timeout'); })]);
try { await withTimeout(sleep(500, 'slow API'), 100); }
catch (e) { console.log('caught:', e.message); }
```

Two independent requests awaited one after the other take the **sum** of their times; `Promise.all` takes the **maximum**. This is one of the most common front-end performance bugs.

## 5.7 Fetching data

`fetch` returns a promise of a `Response`. It rejects only on **network** failure; an HTTP 404 or 500 still fulfils, so always check `response.ok`. Cancel stale requests with an `AbortController` (for example, when the user types again in a search box).

```js run fetch against a local API: checking ok, parsing JSON, aborting
import http from 'node:http';
const server = http.createServer((req, res) => {
  if (req.url === '/api/meters') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 'SM-1', kwh: 12.5 }, { id: 'SM-2', kwh: 8 }]));
  } else if (req.url === '/slow') { setTimeout(() => res.end('late'), 1000); }
  else { res.writeHead(404); res.end('not found'); }
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
async function getJson(path, opts) {
  const res = await fetch(base + path, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}
console.log(await getJson('/api/meters'));
try { await getJson('/api/nope'); } catch (e) { console.log('error:', e.message); }
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 100);
try { await getJson('/slow', { signal: ctrl.signal }); }
catch (e) { console.log('aborted:', e.name); }
server.close(); server.closeAllConnections();
```

## 5.8 Debounce and throttle

**Debounce**: run only after the events stop for N ms (search-as-you-type: one request after the user pauses). **Throttle**: run at most once every N ms (scroll and resize handlers). Both are closures over a timer, and both are classic machine-coding interview tasks.

```js run Implementing debounce and throttle, and counting the calls
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
function throttle(fn, ms) {
  let last = -Infinity;
  return (...args) => {
    const now = performance.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}
const calls = { debounced: [], throttled: [] };
const search = debounce(q => calls.debounced.push(q), 100);
const onScroll = throttle(y => calls.throttled.push(y), 100);
const typed = 'kolkata';
for (let i = 0; i < typed.length; i++) {          // a keystroke every 30 ms
  setTimeout(() => { search(typed.slice(0, i + 1)); onScroll(i); }, i * 30);
}
setTimeout(() => {
  console.log('events:', typed.length);
  console.log('debounced calls:', calls.debounced);
  console.log('throttled calls:', calls.throttled.length, '->', calls.throttled);
}, 600);
```

Seven keystrokes (one every 30 ms) produced a single debounced search, for the complete word, and two throttled calls, at 0 ms and 120 ms. This throttle fires on the **leading** edge only, so the last keystroke at 180 ms was dropped; production versions (such as lodash's) also fire on the trailing edge so the final value is never lost.

## 5.9 Modules

ES modules (`export`, `import`) give each file its own scope. Named exports (`export function fetchMeters`) are preferred over default exports for searchability. `import()` loads a module **lazily**, the basis of code splitting (Chapter 10). In the browser, `<script type="module">` enables them; bundlers resolve `import 'react'` from `node_modules`.

## 5.10 Practical lessons

- `===` always; floats are approximate; objects are references (`structuredClone` for deep copies).
- Closures capture variables; `let` per iteration; `this` depends on the call, arrows inherit it.
- Event loop: synchronous code, then all microtasks, then one task; never block the thread.
- `Promise.all` for independent requests; check `response.ok`; abort stale requests.
- Debounce input, throttle scroll.

# Chapter 6: The DOM and Browser APIs
%Selecting and changing elements, events and delegation, storage, and safe rendering

## 6.1 Selecting and changing elements

The **DOM** is the live tree of objects the browser built from the HTML. Scripts read and change it, and the browser re-renders.

| Task | API |
|---|---|
| Select | `document.querySelector('.card')`, `querySelectorAll('li')`, `getElementById` |
| Create and insert | `document.createElement('li')`, `el.append(child)`, `el.prepend`, `before`, `after`, `remove()` |
| Text | `el.textContent = 'x'` (safe: never parsed as HTML) |
| HTML | `el.innerHTML = '<b>x</b>'` (parsed: never with user input, Chapter 11) |
| Attributes and classes | `el.setAttribute('aria-expanded', 'true')`, `el.dataset.id`, `el.classList.toggle('open')` |
| Styles | Toggle classes; avoid setting many inline styles |
| Layout reads | `getBoundingClientRect()`, `offsetHeight` (these can force a synchronous layout) |

```html run Building a list from data with createElement and a DocumentFragment
<ul id="meters"></ul>
<script>
  const data = [{ id: 'SM-1', kwh: 12.5 }, { id: 'SM-2', kwh: 8 }, { id: 'SM-3', kwh: 20 }];
  const frag = document.createDocumentFragment();     // build off-screen, insert once
  for (const m of data) {
    const li = document.createElement('li');
    li.dataset.id = m.id;
    li.textContent = `${m.id}: ${m.kwh} kWh`;
    if (m.kwh > 10) li.classList.add('high');
    frag.append(li);
  }
  document.getElementById('meters').append(frag);
  console.log(document.getElementById('meters').outerHTML);
  const high = [...document.querySelectorAll('li.high')].map(li => li.dataset.id);
  console.log('high usage:', high);
</script>
```

## 6.2 Events: bubbling, capturing and delegation

An event (a click, a key press, a form submit) travels in three phases: **capture** (from `window` down to the target), **target**, and **bubble** (back up). `addEventListener(type, handler)` listens in the bubble phase by default. `event.target` is the element that was actually clicked; `event.currentTarget` is the element whose listener is running. `stopPropagation()` stops the journey; `preventDefault()` cancels the browser's default action (following a link, submitting a form).

**Event delegation**: put one listener on a parent and use `event.target.closest(...)` to find which child was clicked. It handles thousands of rows with one listener and works for rows added later.

```html run The path of a click, and one delegated listener for a whole table
<table id="t"><tbody>
  <tr data-id="SM-1"><td>SM-1</td><td><button class="del">Delete</button></td></tr>
  <tr data-id="SM-2"><td>SM-2</td><td><button class="del">Delete</button></td></tr>
</tbody></table>
<script>
  const t = document.getElementById('t');
  const log = (phase) => (e) => {
    const where = e.currentTarget.nodeName ?? 'window';
    console.log(`${phase.padEnd(7)} at ${where} (target: ${e.target.nodeName})`);
  };
  window.addEventListener('click', log('capture'), true);
  t.addEventListener('click', log('capture'), true);
  t.addEventListener('click', log('bubble'));
  window.addEventListener('click', log('bubble'));
  t.addEventListener('click', (e) => {                 // delegation
    const btn = e.target.closest('button.del');
    if (!btn) return;
    const row = btn.closest('tr');
    console.log('delegated handler deletes', row.dataset.id);
    row.remove();
  });
  const added = document.createElement('tr');           // a row added later still works
  added.dataset.id = 'SM-9';
  added.innerHTML = '<td>SM-9</td><td><button class="del">Delete</button></td>';
  t.tBodies[0].append(added);
  added.querySelector('button').click();
  console.log('rows left:', [...t.rows].map(r => r.dataset.id).join(', '));
</script>
```

## 6.3 Forms in JavaScript

Listen for `submit` on the form (not `click` on the button, so the Enter key works too), call `preventDefault()`, read values with `new FormData(form)`, validate, send with `fetch`, and disable the button while the request is in flight to prevent double submission.

## 6.4 Storage in the browser

| Store | Size | Lifetime | Sent to server? | Use for |
|---|---|---|---|---|
| Cookies | ~4 KB each | Set by `Expires`/`Max-Age` | **Yes**, with every request to the domain | Session IDs (with `HttpOnly; Secure; SameSite`) |
| `localStorage` | ~5 MB per origin | Until cleared | No | Preferences: theme, last-used filter |
| `sessionStorage` | ~5 MB | Until the tab closes | No | Per-tab draft state |
| IndexedDB | Large (a share of disk) | Until cleared | No | Offline data, caches of records |
| Cache API (service worker) | Large | Until cleared | No | Offline assets and responses (PWAs) |

All storage is per **origin** (scheme + host + port) and readable by any script running on that origin. Never store secrets or long-lived tokens in `localStorage`: one XSS bug (Chapter 11) exposes them; prefer `HttpOnly` cookies, which scripts cannot read.

```html run localStorage stores strings only
<script>
  try {
    localStorage.clear();
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('filters', JSON.stringify({ city: 'Kolkata', min: 10 }));
    localStorage.setItem('count', 5);
    console.log('theme:', localStorage.getItem('theme'));
    console.log('count is a', typeof localStorage.getItem('count'));
    console.log('filters:', JSON.parse(localStorage.getItem('filters')).city);
    console.log('missing key:', localStorage.getItem('nope'));
  } catch (e) {
    console.log('storage unavailable here:', e.name);
  }
</script>
```

## 6.5 Rendering performance in the DOM

Reading a layout property (`offsetHeight`) right after a style change forces the browser to compute layout immediately. Doing that in a loop, write–read–write–read, is **layout thrashing**: batch all reads first, then all writes, or use `requestAnimationFrame` for visual updates.

```html run Layout thrashing versus batched reads and writes
<div id="box"></div>
<script>
  const box = document.getElementById('box');
  for (let i = 0; i < 400; i++) box.append(Object.assign(document.createElement('p'),
    { textContent: 'row ' + i, style: 'margin:0;width:100px' }));
  const rows = [...box.children];
  const time = (fn) => { const t = performance.now(); fn(); return performance.now() - t; };
  const thrash = time(() => {
    for (const r of rows) r.style.width = (r.offsetWidth + 1) + 'px';  // read, write, read...
  });
  const batched = time(() => {
    const widths = rows.map(r => r.offsetWidth);                       // all reads
    rows.forEach((r, i) => { r.style.width = (widths[i] + 1) + 'px'; }); // then all writes
  });
  console.log(`interleaved read/write is slower than batched: ${thrash > batched}`);
  console.log(`at least 3 times slower: ${thrash > 3 * batched}`);
</script>
```

## 6.6 Practical lessons

- Prefer `textContent`, `classList` and `dataset`; build lists off-screen and insert once.
- Events capture down and bubble up; delegate from a parent with `closest()`.
- Handle `submit`, `preventDefault`, `FormData`, disable while sending.
- localStorage for non-sensitive preferences only; sessions in `HttpOnly` cookies.
- Batch DOM reads before writes.
