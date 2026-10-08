## Part 5 solutions

### F5.1 A to-do list in plain JavaScript

Keep the **data** in an array and re-render the list from it after each change; one delegated listener on the `<ul>` handles both toggling and deleting.

```html run Vanilla to-do list with one delegated listener
<form id="add"><input id="text" aria-label="New task"> <button>Add</button></form>
<ul id="list"></ul>
<script>
  let todos = [], nextId = 1;
  const list = document.getElementById('list');
  function render() {
    list.replaceChildren(...todos.map(t => {
      const li = document.createElement('li');
      li.dataset.id = t.id;
      const label = document.createElement('span');
      label.textContent = t.text; label.className = 'label';
      if (t.done) li.classList.add('done');
      const del = document.createElement('button');
      del.textContent = 'Delete'; del.className = 'delete';
      del.setAttribute('aria-label', `Delete ${t.text}`);
      li.append(label, ' ', del);
      return li;
    }));
  }
  document.getElementById('add').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('text');
    if (!input.value.trim()) return;
    todos = [...todos, { id: nextId++, text: input.value.trim(), done: false }];
    input.value = ''; render();
  });
  list.addEventListener('click', e => {
    const id = Number(e.target.closest('li')?.dataset.id);
    if (e.target.closest('button.delete')) todos = todos.filter(t => t.id !== id);
    else if (e.target.closest('.label'))
      todos = todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
    render();
  });
  const add = text => { document.getElementById('text').value = text;
                        document.getElementById('add').requestSubmit(); };
  add('Read meter SM-42'); add('Pay bill'); add('   '); add('Call electrician');
  list.querySelector('li[data-id="2"] .label').click();
  list.querySelector('li[data-id="1"] .delete').click();
  console.log(todos.map(t => `${t.done ? '[x]' : '[ ]'} ${t.text}`).join('\n'));
  console.log('listeners on the list: 1, rows rendered:', list.children.length);
</script>
```

`requestSubmit()` triggers the same `submit` event as pressing Enter (unlike `form.submit()`, which skips it). The blank entry was ignored, Pay bill was toggled, and the first task was deleted.

### F5.2 Live search

```html run Debounced filtering with safe highlighting
<input id="q" aria-label="Search cities"> <span id="count" aria-live="polite"></span>
<ul id="out"></ul>
<script>
  window.__ready = false;
  const base = ['Kolkata', 'Pune', 'Delhi', 'Chennai', 'Kochi', 'Kozhikode', 'Kota', 'Agra'];
  const cities = Array.from({ length: 500 }, (_, i) => `${base[i % base.length]} ${i + 1}`);
  let runs = 0;
  function filter(q) {
    runs++;
    const out = document.getElementById('out');
    const hits = cities.filter(c => c.toLowerCase().includes(q.toLowerCase()));
    out.replaceChildren(...hits.slice(0, 5).map(c => {
      const li = document.createElement('li');
      const at = c.toLowerCase().indexOf(q.toLowerCase());
      const mark = document.createElement('mark');
      mark.textContent = c.slice(at, at + q.length);
      li.append(c.slice(0, at), mark, c.slice(at + q.length));   // text nodes, no parsing
      return li;
    }));
    document.getElementById('count').textContent = `${hits.length} results`;
  }
  const debounce = (fn, ms) => {
    let t;
    return v => { clearTimeout(t); t = setTimeout(() => fn(v), ms); };
  };
  const onInput = debounce(filter, 150);
  document.getElementById('q').addEventListener('input', e => onInput(e.target.value));
  const typed = 'Koz';
  [...typed].forEach((_, i) => setTimeout(() => {
    const q = document.getElementById('q'); q.value = typed.slice(0, i + 1);
    q.dispatchEvent(new Event('input'));
  }, i * 60));
  setTimeout(() => {
    console.log(`typed ${typed.length} characters, filter ran ${runs} time(s)`);
    console.log(document.getElementById('count').textContent);
    console.log(document.getElementById('out').firstElementChild.innerHTML);
    window.__ready = true;
  }, 600);
</script>
```

The filter ran once, for the whole word. The match is wrapped in a `<mark>` built from text nodes, so a city name containing `<script>` would still be shown as text. The `aria-live` count announces results to screen-reader users without moving focus.

### F5.3 Accessible tabs

```html run Tabs with roles, roving tabindex and arrow keys
<div role="tablist" aria-label="Meter views" id="tabs">
  <button role="tab" id="t1" aria-controls="p1">Readings</button>
  <button role="tab" id="t2" aria-controls="p2">Forecast</button>
  <button role="tab" id="t3" aria-controls="p3">Billing</button>
</div>
<div role="tabpanel" id="p1" aria-labelledby="t1">Readings table</div>
<div role="tabpanel" id="p2" aria-labelledby="t2">Forecast chart</div>
<div role="tabpanel" id="p3" aria-labelledby="t3">Billing history</div>
<script>
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function select(tab) {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;                         // roving tabindex: one tab stop
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    }
    tab.focus();
  }
  document.getElementById('tabs').addEventListener('click', e => {
    if (e.target.role === 'tab') select(e.target);
  });
  document.getElementById('tabs').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement);
    const n = tabs.length;
    const next = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n,
                   Home: 0, End: n - 1 }[e.key];
    if (next !== undefined) { e.preventDefault(); select(tabs[next]); }
  });
  const mark = t => (t.getAttribute('aria-selected') === 'true' ? '*' : '');
  const panel = () => document.querySelector('[role=tabpanel]:not([hidden])').textContent;
  const state = () => tabs.map(t => `${t.textContent}${mark(t)}(${t.tabIndex})`).join(' ') +
    ' | visible panel: ' + panel();
  select(tabs[0]); console.log('start:     ', state());
  const press = key => document.activeElement.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true }));
  press('ArrowRight'); console.log('ArrowRight:', state());
  press('ArrowLeft'); press('ArrowLeft'); console.log('Left x2:   ', state());
  press('Home'); console.log('Home:      ', state());
  tabs[1].click(); console.log('click 2nd: ', state());
</script>
```

Only the selected tab is in the Tab order (`tabindex="0"`); arrow keys move between tabs, as screen-reader users expect, and the left arrow wraps from the first tab to the last.

### F5.4 Where to store it

| Data | Choice | Why |
|---|---|---|
| Session identifier | Cookie: `HttpOnly; Secure; SameSite=Lax` | Sent automatically, unreadable by scripts (XSS cannot steal it) |
| Chosen theme | localStorage | Not sensitive; persists; read before first paint to avoid a flash |
| Half-written form in one tab | sessionStorage | Survives reloads of that tab only |
| 5,000 offline readings | IndexedDB | Large, structured, queryable, asynchronous |
| Payment card number | **Do not store in the browser** (and not on your servers either: use the payment provider's hosted fields, which keep you out of PCI scope) | Any script on the page could read it |
| Refresh token | `HttpOnly` cookie scoped to the refresh endpoint (path), or not in the browser at all (backend-for-frontend pattern) | Long-lived credential: must not be script-readable |

## Part 6 solutions

### F6.1 Exhaustive shapes

```ts run The exhaustive area function
type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number }
  | { kind: 'triangle'; base: number; height: number };
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'rect': return s.w * s.h;
    case 'triangle': return 0.5 * s.base * s.height;
    default: { const unreachable: never = s; return unreachable; }
  }
}
const shapes: Shape[] = [{ kind: 'circle', r: 1 }, { kind: 'rect', w: 2, h: 3 },
                         { kind: 'triangle', base: 4, height: 5 }];
console.log(shapes.map(s => `${s.kind}=${area(s).toFixed(2)}`).join(' '));
```

```ts run Adding a hexagon without updating area()
type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number }
  | { kind: 'hexagon'; side: number };
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'rect': return s.w * s.h;
    default: { const unreachable: never = s; return unreachable; }
  }
}
console.log(area({ kind: 'hexagon', side: 1 }));
```

The compiler names the unhandled member: in the `default` branch `s` can still be a hexagon, which is not assignable to `never`.

### F6.2 A typed pluck

```ts run pluck infers the property's type
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(it => it[key]);
}
type Meter = { id: string; kwh: number; online: boolean };
const meters: Meter[] = [{ id: 'SM-1', kwh: 12.5, online: true },
                         { id: 'SM-2', kwh: 8, online: false }];
const ids = pluck(meters, 'id');                                  // string[]
const total = pluck(meters, 'kwh').reduce((a, b) => a + b, 0);    // number[] -> number
console.log(ids.map(s => s.toLowerCase()), total);
```

```ts run A key that does not exist is rejected
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(it => it[key]);
}
type Meter = { id: string; kwh: number; online: boolean };
const meters: Meter[] = [{ id: 'SM-1', kwh: 12.5, online: true }];
const wrong = pluck(meters, 'city');
```

Because `K` is constrained to `keyof T`, the result type follows the key (`string[]` for `'id'`, `number[]` for `'kwh'`), and a misspelt key is a compile error rather than an array of `undefined`.

### F6.3 Validate at the boundary

```ts run A hand-written type guard for untrusted JSON
type Meter = { id: string; kwh: number; city?: string };
function isMeter(x: unknown): x is Meter {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === 'string' && /^SM-\d+$/.test(o.id)
    && typeof o.kwh === 'number' && Number.isFinite(o.kwh) && o.kwh >= 0
    && (o.city === undefined || typeof o.city === 'string');
}
const body = `[{"id":"SM-1","kwh":12.5},{"id":"SM-2","kwh":"8"},null,
               {"id":"SM-3","kwh":-1},{"id":"SM-4","kwh":3,"city":"Pune"},{"kwh":2}]`;
const parsed: unknown = JSON.parse(body);
const items = Array.isArray(parsed) ? parsed : [];
const meters = items.filter(isMeter);       // Meter[]: narrowed by the guard
console.log(`kept ${meters.length}, rejected ${items.length - meters.length}:`,
            meters.map(m => m.id).join(', '));
```

Typing the parse result as `unknown` forces a check before use; the guard both validates at run time and tells the compiler the type. Libraries such as Zod generate both from one schema, so they cannot drift apart.

## Part 7 solutions

### F7.1 Counter with a step

```html run A counter with step, reset and a disabled minus button
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  function Counter() {
    const [count, setCount] = React.useState(0);
    const [step, setStep] = React.useState(1);
    const clamp = v => Math.min(10, Math.max(1, Math.trunc(Number(v)) || 1));
    return (
      <div>
        <button id="minus" onClick={() => setCount(c => Math.max(0, c - step))}
                disabled={count === 0} aria-label="Decrease">−</button>
        <output id="value" aria-live="polite"> {count} </output>
        <button id="plus" onClick={() => setCount(c => c + step)}
                aria-label="Increase">+</button>
        <label> Step <input id="step" type="number" min="1" max="10" value={step}
               onChange={e => setStep(clamp(e.target.value))} /></label>
        <button id="reset" onClick={() => setCount(0)}>Reset</button>
      </div>);
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<Counter />);
  const $ = id => document.getElementById(id);
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const typeStep = v => {
    setValue.call($('step'), v);
    $('step').dispatchEvent(new Event('input', { bubbles: true }));
  };
  const log = label => console.log(label.padEnd(22), 'value', $('value').textContent.trim(),
                                   '| minus disabled:', $('minus').disabled);
  const steps = [
    () => log('start'),
    () => { $('plus').click(); $('plus').click(); }, () => log('plus twice'),
    () => typeStep('5'),
    () => $('plus').click(), () => log('step 5, plus'),
    () => $('minus').click(), () => log('step 5, minus'),
    () => typeStep('99'),
    () => console.log('step input after typing 99:', $('step').value),
    () => { window.__ready = true; },
  ];
  steps.forEach((f, i) => setTimeout(f, 100 + i * 40));
</script>
```

After the two increments by 1 and one by 5 the value is 7; minus with step 5 gives 2, not below 0 (the `Math.max` guard; the button is disabled only at exactly 0). Typing 99 into the step field is clamped to 10.

### F7.2 Filtered to-dos

```html run State holds only the list and the filter; everything else is derived
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  const FILTERS = { all: () => true, active: t => !t.done, done: t => t.done };
  function Todos() {
    const [todos, setTodos] = React.useState([]);
    const [filter, setFilter] = React.useState('all');
    const [text, setText] = React.useState('');
    const visible = todos.filter(FILTERS[filter]);          // derived, not stored
    const left = todos.filter(t => !t.done).length;
    const add = e => {
      e.preventDefault();
      if (!text.trim()) return;
      const todo = { id: crypto.randomUUID(), text: text.trim(), done: false };
      setTodos(ts => [...ts, todo]);
      setText('');
    };
    const toggle = id =>
      setTodos(ts => ts.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
    window.api = { setText, toggle, setFilter, todos };
    return (
      <div>
        <form onSubmit={add}><input value={text} onChange={e => setText(e.target.value)} />
          <button>Add</button></form>
        <ul>{visible.map(t => <li key={t.id} onClick={() => toggle(t.id)}>
          {t.done ? '[x] ' : '[ ] '}{t.text}</li>)}</ul>
        <p>{left} left · {['all', 'active', 'done'].map(f =>
          <button key={f} aria-pressed={filter === f}
                  onClick={() => setFilter(f)}>{f}</button>)}</p>
      </div>);
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<Todos />);
  const submit = () => document.querySelector('form').requestSubmit();
  const show = label => {
    const rows = [...document.querySelectorAll('li')].map(li => li.textContent).join(', ');
    console.log(label.padEnd(16), rows || '(none)', '|',
                document.querySelector('p').firstChild.textContent);
  };
  const run = [
    () => api.setText('Read meter'), submit, () => api.setText('Pay bill'), submit,
    () => api.setText('Fix fuse'), submit, () => show('after adding:'),
    () => document.querySelectorAll('li')[1].click(), () => show('toggled 2nd:'),
    () => api.setFilter('active'), () => show('filter active:'),
    () => api.setFilter('done'), () => show('filter done:'),
    () => { window.__ready = true; },
  ];
  run.forEach((f, i) => setTimeout(f, 100 + i * 30));
</script>
```

Storing `visible` or `left` in state as well would invite bugs where they disagree with `todos`; computing them during render keeps a single source of truth.

### F7.3 useDebouncedValue

```html run A debounced value hook, and how often the filter really runs
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  function useDebouncedValue(value, ms) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
      const t = setTimeout(() => setDebounced(value), ms);
      return () => clearTimeout(t);          // a new keystroke cancels the pending update
    }, [value, ms]);
    return debounced;
  }
  const CITIES = ['Kolkata', 'Kochi', 'Kozhikode', 'Kota', 'Pune', 'Delhi', 'Chennai'];
  let filterRuns = 0;
  function Search() {
    const [q, setQ] = React.useState('');
    const dq = useDebouncedValue(q, 150);
    const hits = React.useMemo(() => { filterRuns++;
      return CITIES.filter(c => c.toLowerCase().startsWith(dq.toLowerCase())); }, [dq]);
    window.setQ = setQ;
    return <p>{q} -> {hits.join(', ')}</p>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<Search />);
  ['K', 'Ko', 'Koz'].forEach((q, i) => setTimeout(() => setQ(q), 100 + i * 50));
  setTimeout(() => console.log('mid-typing:', document.querySelector('p').textContent), 220);
  setTimeout(() => {
    console.log('after a pause:', document.querySelector('p').textContent);
    console.log('filter computations:', filterRuns, '(first render, then after the pause)');
    window.__ready = true;
  }, 600);
</script>
```

While typing, the input value updates on every keystroke (the UI stays responsive), but the list still shows the result for the empty query; the expensive filter runs only after a 150 ms pause. React 18's `useDeferredValue` is a built-in alternative that defers by priority rather than by time.

### F7.4 The runaway effect

```html run An effect without dependencies that sets state, before and after the fix
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  let rendersBuggy = 0, rendersFixed = 0;
  function Buggy() {
    rendersBuggy++;
    const [items, setItems] = React.useState([]);
    const data = ['SM-1', 'SM-2'];                  // a new array on every render
    React.useEffect(() => { if (rendersBuggy < 50) setItems(data); });  // after EVERY render
    return <p>{items.length}</p>;
  }
  function Fixed() {
    rendersFixed++;
    const [items, setItems] = React.useState([]);
    React.useEffect(() => { setItems(['SM-1', 'SM-2']); }, []);          // once, after mount
    return <p>{items.length}</p>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<><Buggy /><Fixed /></>);
  setTimeout(() => { console.log('renders, buggy:', rendersBuggy, '| fixed:', rendersFixed);
                     window.__ready = true; }, 300);
</script>
```

The effect has no dependency array, so it runs after every render; it sets state to a **new** array each time, which React sees as a change, which renders again: an infinite loop (stopped here at 50 by a guard; without it React eventually throws "Maximum update depth exceeded"). The fix runs it once (`[]`). Better still: if the data is constant or derived from props, do not put it in state at all.

### F7.5 Star rating

Native radio inputs give keyboard behaviour (arrow keys move and select) and the right semantics for free; the stars are their labels, and the circles are hidden visually but not from assistive technology.

```html run A five-star rating built on a radio group
<!-- shot: fe_stars.png 720x140 -->
<style>
  fieldset { border: 0; padding: 0; font-family: "DejaVu Sans", sans-serif; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  label { font-size: 34px; cursor: pointer; color: #cbd5e1; }
  label.on { color: #f59e0b; }
  input:focus-visible + label { outline: 3px solid #2563eb; outline-offset: 2px; }
</style>
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  function StarRating({ value, onChange }) {
    const [hover, setHover] = React.useState(0);
    const shown = hover || value;
    return (
      <fieldset onMouseLeave={() => setHover(0)}>
        <legend>Rate your installer</legend>
        {[1, 2, 3, 4, 5].map(n => (
          <React.Fragment key={n}>
            <input className="sr" type="radio" name="rating" id={`star${n}`} value={n}
                   checked={value === n} onChange={() => onChange(n)}
                   aria-label={n === 1 ? '1 star' : `${n} stars`} />
            <label htmlFor={`star${n}`} className={n <= shown ? 'on' : ''}
                   onMouseEnter={() => setHover(n)}>★</label>
          </React.Fragment>))}
      </fieldset>);
  }
  function App() {
    const [rating, setRating] = React.useState(0);
    const change = v => { console.log('onChange', v); setRating(v); };
    return <StarRating value={rating} onChange={change} />;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  setTimeout(() => document.querySelector('label[for=star3]').click(), 100);
  setTimeout(() => {
    console.log('checked:', document.querySelector('input:checked').value,
                '| lit stars:', document.querySelectorAll('label.on').length);
    const star4 = document.querySelector('label[for=star4]');
    star4.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }, 150);
  setTimeout(() => {
    console.log('hovering the 4th star lights:', document.querySelectorAll('label.on').length,
                '| still checked:', document.querySelector('input:checked').value);
    const out = new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body });
    document.querySelector('fieldset').dispatchEvent(out);
  }, 200);
  setTimeout(() => {
    console.log('after the mouse leaves, lit:', document.querySelectorAll('label.on').length);
    document.getElementById('star3').focus();
    window.__ready = true;
  }, 250);
</script>
```

Clicking a label selects its radio input (and calls `onChange`); hovering previews without changing the value; leaving restores it. Because they are real radio buttons, Tab reaches the group once and the arrow keys change the rating, and a screen reader announces "Rate your installer, group, 3 stars, radio button, checked, 3 of 5". The screenshot shows the final state: three stars selected, the hover preview gone.

## Part 8 solutions

### F8.1 Fix what axe finds

```html run Before: four problems on a product card
<!doctype html><html><head><meta charset="utf-8"><title>Card</title></head><body><main>
<h1>Smart plug</h1>
<img src="plug.png">
<p style="color: #b0b0b0">₹1,499</p>
<button><svg width="16" height="16"><path d="M2 8h12"/></svg></button>
</main>
<script src="lib/axe.js"></script>
<script>
  window.__ready = false;
  axe.run().then(r => { r.violations.forEach(v => console.log(v.impact, v.id));
                        window.__ready = true; });
</script></body></html>
```

```html run After: language, alt text, contrast and an accessible name
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Card</title></head>
<body><main>
<h1>Smart plug</h1>
<img src="plug.png" alt="White smart plug with a power button">
<p style="color: #525252">₹1,499</p>
<button aria-label="Add smart plug to cart"><svg width="16" height="16" aria-hidden="true">
  <path d="M2 8h12"/></svg></button>
</main>
<script src="lib/axe.js"></script>
<script>
  window.__ready = false;
  axe.run().then(r => {
    console.log('violations:', r.violations.length);
    window.__ready = true;
  });
</script></body></html>
```

### F8.2 A slow LCP

In order of likely impact:

1. **The image is discovered late.** A CSS `background-image` is found only after the stylesheet has downloaded and been parsed, and it cannot be prioritised. Use an `<img>` in the HTML with `fetchpriority="high"` (or `<link rel="preload" as="image">`), and never `loading="lazy"` on the LCP image.
2. **The image is far too heavy.** 1.8 MB on a mid-range phone over 4G takes seconds. Serve AVIF/WebP, resize to the displayed size with `srcset`/`sizes` (a phone needs perhaps 800 px wide, not 3000), compress (target under 150 KB).
3. **Render-blocking CSS and JavaScript** before it: inline critical CSS, `defer` scripts, remove unused code; avoid client-side rendering for the hero (SSR or static HTML so the `<img>` is in the first response).
4. **Slow server or no CDN**: check TTFB; cache the HTML at the edge; serve images from a CDN close to users.
5. **Third-party scripts and fonts** competing for bandwidth; `preconnect` to the image CDN.

Then verify in the field (real-user LCP at the 75th percentile), not only in Lighthouse.

### F8.3 Escaping output

```js run escapeHtml against common payloads
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const payloads = ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>',
                  '" onmouseover="alert(1)'];
for (const p of payloads) {
  console.log(`<td>${escapeHtml(p)}</td>`);
  console.log(`<input value="${escapeHtml(p)}">`);
}
const url = 'javascript:alert(document.cookie)';
console.log(`<a href="${escapeHtml(url)}">profile</a>  <- still executes when clicked!`);
const safeUrl = u => (/^https?:\/\//i.test(u) ? u : '#');
console.log(`<a href="${escapeHtml(safeUrl(url))}">profile</a>  <- scheme allow-listed`);
```

Escaping makes the payloads display as text, both between tags and inside a quoted attribute. It does **not** help when the context itself is code: a `javascript:` URL in `href` contains no special HTML characters, and inside `<script>` blocks or event-handler attributes, HTML escaping is the wrong encoding entirely. Allow-list URL schemes, never build scripts from user data, and prefer frameworks that escape by default (React) plus a CSP.

### F8.4 Unit tests

```js run A validator and its test suite
// node --test (this block is run by the test runner)
import test from 'node:test';
import assert from 'node:assert/strict';
const isValidMeterSerial = s => typeof s === 'string' && /^SM-[1-9]\d{0,4}$/.test(s);
test('accepts valid serials', () => {
  for (const s of ['SM-1', 'SM-42', 'SM-99999']) assert.ok(isValidMeterSerial(s), s);
});
test('rejects wrong formats', () => {
  for (const s of ['sm-1', 'SM-', 'SM-0', 'SM-007', 'SM-123456', 'SM 12', 'XSM-12', 'SM-12x'])
    assert.equal(isValidMeterSerial(s), false, s);
});
test('rejects non-strings and lookalikes', () => {
  for (const s of [null, undefined, 42, ['SM-1'], 'SM-1\n', ' SM-1'])
    assert.equal(isValidMeterSerial(s), false, JSON.stringify(s));
});
```

The edge cases matter more than the happy path: the anchors `^…$` reject `XSM-12` and `SM-12x`, and `'SM-1\n'` is rejected because JavaScript's `$` does not match before a trailing newline (unlike some other regex engines, a common source of validation bypasses). The array `['SM-1']` would pass a check that called `regex.test(s)` without the type check, because `test` converts its argument to the string `'SM-1'`.
