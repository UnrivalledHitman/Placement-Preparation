# Chapter 7: TypeScript
%Static types for JavaScript: catching bugs before the code runs

## 7.1 Why TypeScript

TypeScript is JavaScript plus a **static type system**. The compiler (`tsc`) checks the types and then **erases** them, producing plain JavaScript; types cost nothing at run time and give nothing at run time either (they do not validate API responses). The pay-off: typos, wrong argument types, missing `null` checks and unhandled cases are reported in the editor, before a user finds them. Most product companies now write front ends (and many Node back ends) in TypeScript.

The examples below were compiled with `tsc --strict`. Where the compiler rejects the code, its error message is the output.

```ts run The compiler catches what JavaScript would only discover at run time
type Reading = { meter: string; kwh: number; at: Date };
function cost(r: Reading, ratePerKwh: number): number {
  return r.kwh * ratePerKwh;
}
const r: Reading = { meter: 'SM-42', kwh: 12.5, at: new Date(0) };
cost(r, '7.5');
cost({ meter: 'SM-1', kwh: 3 }, 7.5);
console.log(r.kWh);
```

Three bugs, three compile errors, and nothing ran. Each would have been a silent wrong value (`'7.5'` multiplied as a string becomes a number by coercion, so the first would even "work" by accident) or an `undefined` at run time.

## 7.2 The everyday types

| Type | Example |
|---|---|
| Primitives | `string`, `number`, `boolean`, `bigint`, `null`, `undefined` |
| Arrays and tuples | `number[]`, `Array<Reading>`, `[number, number]` |
| Object types | `type Meter = { id: string; city?: string; readonly serial: string }` (`?` optional) |
| Unions and literals | `type Status = 'online' \| 'offline' \| 'fault'` |
| Functions | `(r: Reading) => number` |
| Records and index signatures | `Record<string, number>`, `{ [city: string]: number }` |
| `unknown` versus `any` | `unknown` must be checked before use; `any` switches checking off (avoid) |

`interface` and `type` both describe object shapes; interfaces can be extended and merged, type aliases can also name unions and other types. Pick one style per codebase.

## 7.3 Narrowing and discriminated unions

With a **union**, TypeScript only allows what is valid for every member until you **narrow** it with a check: `typeof`, `in`, `instanceof`, equality, or a shared **discriminant** field. A **discriminated union** plus an exhaustive `switch` makes impossible states unrepresentable and forces you to handle every case: when a new case is added, the compiler finds every `switch` that forgot it.

```ts run Modelling loading, success and error so that impossible states cannot exist
type Meter = { id: string; kwh: number };
type State =
  | { status: 'loading' }
  | { status: 'success'; data: Meter[] }
  | { status: 'error'; message: string };

function render(s: State): string {
  switch (s.status) {
    case 'loading': return 'Loading...';
    case 'success': return s.data.map(m => `${m.id}=${m.kwh}`).join(', ');
    case 'error':   return `Error: ${s.message}`;
    default: {
      const never: never = s;          // compile error if a status is not handled
      return never;
    }
  }
}
console.log(render({ status: 'loading' }));
console.log(render({ status: 'success', data: [{ id: 'SM-1', kwh: 12.5 }] }));
console.log(render({ status: 'error', message: 'HTTP 503' }));

function label(x: string | number | null): string {
  if (x === null) return 'none';
  if (typeof x === 'number') return x.toFixed(1);   // x is number here
  return x.toUpperCase();                           // x is string here
}
console.log(label(null), label(3.14159), label('kolkata'));
```

Compare this with the common alternative, `{ loading: boolean; data?: Meter[]; error?: string }`, which allows nonsense such as `loading: true` together with an error and data.

```ts run Strict null checks: the most valuable single check
type User = { name: string; address?: { city: string } };
function city(u: User): string {
  return u.address.city;
}
console.log(city({ name: 'Priya' }));
```

The compiler refuses the code because `address` may be missing, the bug behind countless "Cannot read properties of undefined" crashes. The fix is `u.address?.city ?? 'unknown'`.

## 7.4 Generics

A **generic** function or type works for many types while keeping them related: the output type depends on the input type.

```ts run Generic helpers that keep types precise
function first<T>(items: T[]): T | undefined { return items[0]; }
function groupBy<T, K extends string>(items: T[], key: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const it of items) (out[key(it)] ??= []).push(it);
  return out;
}
type Reading = { meter: string; city: 'Kolkata' | 'Pune'; kwh: number };
const rs: Reading[] = [
  { meter: 'SM-1', city: 'Kolkata', kwh: 12.5 }, { meter: 'SM-2', city: 'Pune', kwh: 8 },
  { meter: 'SM-3', city: 'Kolkata', kwh: 20 },
];
const f = first(rs);                // f: Reading | undefined
console.log(f?.meter, first([1, 2, 3])! + 1);
const byCity = groupBy(rs, r => r.city);   // Record<'Kolkata' | 'Pune', Reading[]>
console.log(Object.entries(byCity).map(([c, v]) => `${c}:${v.length}`).join(' '));

async function getJson<T>(text: string): Promise<T> { return JSON.parse(text) as T; }
const meters = await getJson<{ id: string }[]>('[{"id":"SM-9"}]');
console.log(meters[0].id);
```

> TRAP: `JSON.parse(text) as T` (and a typed `fetch` wrapper) is a **promise to the compiler, not a check**. If the server sends something else, the types lie. Validate untrusted data at the boundary with a schema library (Zod, Valibot) that both checks the value at run time and produces the type.

## 7.5 Utility types

| Utility | Produces |
|---|---|
| `Partial<T>` | All properties optional (a patch object) |
| `Required<T>`, `Readonly<T>` | All required; all read-only |
| `Pick<T, 'a' \| 'b'>`, `Omit<T, 'password'>` | A subset; everything except |
| `Record<K, V>` | An object with keys K and values V |
| `ReturnType<typeof f>`, `Parameters<typeof f>` | Types taken from a function |
| `Awaited<P>` | The value a promise resolves to |
| `keyof T`, `T[K]` | The union of keys; the type of a property |

```ts run Deriving types instead of repeating them
type User = { id: number; name: string; email: string; passwordHash: string };
type PublicUser = Omit<User, 'passwordHash'>;
type UserPatch = Partial<Pick<User, 'name' | 'email'>>;
function toPublic({ passwordHash, ...rest }: User): PublicUser { return rest; }
function update(u: User, patch: UserPatch): User { return { ...u, ...patch }; }
const u: User = { id: 1, name: 'Arjun', email: 'a@example.com', passwordHash: 'x' };
console.log(toPublic(u));
console.log(update(u, { email: 'arjun@example.com' }).email);
```

Deriving `PublicUser` from `User` means that adding a field to `User` updates every derived type. The same types also stop mistakes:

```ts run A patch may not touch fields outside the Pick
type User = { id: number; name: string; email: string; passwordHash: string };
type UserPatch = Partial<Pick<User, 'name' | 'email'>>;
const bad: UserPatch = { passwordHash: 'oops' };
```

## 7.6 Practical lessons

- Turn on `strict`; never use `any` (use `unknown` and narrow).
- Model states as discriminated unions; use `never` for exhaustiveness.
- Generics relate input and output types; derive types with utility types instead of copying them.
- Types are erased: validate API data at run time at the boundary.

# Chapter 8: React
%Components, state, effects, lists and keys, forms, context and custom hooks

## 8.1 The idea

React lets you describe the UI as a **function of state**: `UI = f(state)`. You write **components** (functions returning JSX), give them **props** (inputs from the parent) and **state** (data that changes over time). When state changes, React calls the component again, compares the new output with the previous one (**reconciliation** of the virtual DOM), and updates only the parts of the real DOM that differ. You never write `document.createElement` or `el.textContent = ...` yourself.

JSX is syntax for function calls: `<MeterCard id="SM-1" kwh={12.5} />` becomes `React.createElement(MeterCard, { id: 'SM-1', kwh: 12.5 })`. Curly braces embed JavaScript expressions; `className` replaces `class`; `onClick={handler}` attaches events.

## 8.2 Components, props and state

```html run A small dashboard: components, props, state and an event handler
<!-- shot: fe_react_cards.png 720x260 -->
<style>
  * { box-sizing: border-box; font-family: "DejaVu Sans", sans-serif; }
  .row { display: flex; gap: 12px; }
  .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
  .card.high { border-color: #dc2626; background: #fef2f2; }
  .kwh { font-size: 24px; font-weight: bold; } button { margin-top: 12px; padding: 6px 12px; }
</style>
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  function MeterCard({ id, kwh, limit }) {
    const high = kwh > limit;
    return (
      <div className={'card' + (high ? ' high' : '')}>
        <div>{id}</div>
        <div className="kwh">{kwh.toFixed(1)} kWh</div>
        <small>{high ? `above the ${limit} kWh limit` : 'normal'}</small>
      </div>
    );
  }
  function Dashboard() {
    const [limit, setLimit] = React.useState(15);
    const meters = [{ id: 'SM-1', kwh: 12.5 }, { id: 'SM-2', kwh: 8 },
                    { id: 'SM-3', kwh: 20 }];
    const over = meters.filter(m => m.kwh > limit).length;
    return (
      <div>
        <div className="row">
          {meters.map(m => <MeterCard key={m.id} {...m} limit={limit} />)}
        </div>
        <button onClick={() => setLimit(l => l - 5)}>Lower limit (now {limit})</button>
        <p>{over} of {meters.length} meters over the limit</p>
      </div>
    );
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<Dashboard />);
  setTimeout(() => {
    console.log('before click:', document.querySelector('p').textContent);
    document.querySelector('button').click();
    const after = () => console.log('after click: ', document.querySelector('p').textContent);
    setTimeout(after, 50);
  }, 100);
</script>
```

The screenshot was taken after the click: the limit dropped from 15 to 10, and React re-rendered the cards so that two are now highlighted. Nothing in the code updates the DOM directly; the click changed **state**, and the UI followed.

Rules of state:

- **Never mutate** state (`meters.push(x)`); create a new value (`setMeters([...meters, x])`). React compares by reference, so a mutated array looks unchanged.
- Updates are **asynchronous and batched**: after `setCount(count + 1)`, `count` still holds the old value until the next render. When the new value depends on the old, use the **updater form** `setCount(c => c + 1)`.
- Keep state **minimal**: derive what you can (`over` above is computed, not stored).

```html run Why the updater form matters
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  function Counter() {
    const [a, setA] = React.useState(0);
    const [b, setB] = React.useState(0);
    const plusThreeWrong = () => { setA(a + 1); setA(a + 1); setA(a + 1); };
    const plusThreeRight = () => { setB(x => x + 1); setB(x => x + 1); setB(x => x + 1); };
    return <div><button id="wrong" onClick={plusThreeWrong}>a = {a}</button>
                <button id="right" onClick={plusThreeRight}>b = {b}</button></div>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<Counter />);
  setTimeout(() => {
    document.getElementById('wrong').click(); document.getElementById('right').click();
    setTimeout(() => console.log(document.getElementById('wrong').textContent, '|',
                                 document.getElementById('right').textContent), 50);
  }, 100);
</script>
```

All three `setA(a + 1)` calls read the same `a` (0) from that render's closure, so `a` ends at 1. The updater form receives the latest pending value each time.

## 8.3 Rendering and re-rendering

A component re-renders when its state changes, when its parent re-renders, or when a context it uses changes. Rendering is usually cheap; making it predictable matters more than making it rare. `React.memo(Component)` skips re-rendering when props are shallow-equal, and `useMemo`/`useCallback` keep values and functions stable between renders so that memoised children really are skipped.

```html run Counting renders: a parent update re-renders children unless they are memoised
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  const renders = { plain: 0, memo: 0, memoWithNewFn: 0 };
  function Plain() { renders.plain++; return <i>plain</i>; }
  const Memo = React.memo(function Memo() { renders.memo++; return <i>memo</i>; });
  const MemoFn = React.memo(function MemoFn({ onPick }) {
    renders.memoWithNewFn++; return null;
  });
  function App() {
    const [n, setN] = React.useState(0);
    const onPick = () => {};                   // a new function on every render
    return <div><button onClick={() => setN(n + 1)}>{n}</button>
      <Plain /><Memo /><MemoFn onPick={onPick} /></div>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  window.__ready = false;
  const click = () => document.querySelector('button').click();
  setTimeout(click, 100); setTimeout(click, 150); setTimeout(click, 200);
  setTimeout(() => { console.log('after 3 parent updates:', JSON.stringify(renders));
                     window.__ready = true; }, 250);
</script>
```

`Plain` rendered 4 times (the first render plus 3 updates); `Memo` once. `MemoFn` was memoised too, yet re-rendered every time, because its `onPick` prop was a **new function** on each parent render: wrapping it in `useCallback(() => {}, [])` fixes that. Memoisation only pays off when props are stable, so measure with the React DevTools Profiler before adding it everywhere.

## 8.4 Effects

`useEffect(fn, deps)` runs **after** React has updated the DOM: for synchronising with things outside React (fetching data, subscriptions, timers, manual DOM work). The **dependency array** decides when it re-runs: `[]` once after the first render; `[id]` whenever `id` changes; no array after every render. If the effect returns a function, React calls it as **cleanup** before re-running the effect and when the component unmounts.

```html run Effect timing, cleanup, and the stale-closure interval bug
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  function Meter({ id }) {
    React.useEffect(() => {
      console.log(`subscribe to ${id}`);
      return () => console.log(`unsubscribe from ${id}`);
    }, [id]);
    return <p>{id}</p>;
  }
  function Ticker({ fixed }) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
      const t = setInterval(() => (fixed ? setCount(c => c + 1) : setCount(count + 1)), 20);
      return () => clearInterval(t);
    }, []);                                   // runs once: the closure sees count = 0 forever
    return <span id={fixed ? 'fixed' : 'buggy'}>{count}</span>;
  }
  function App() {
    const [id, setId] = React.useState('SM-1');
    const [show, setShow] = React.useState(true);
    window.setId = setId; window.setShow = setShow;
    return <div>{show && <Meter id={id} />}
                <Ticker fixed={false} /> <Ticker fixed={true} /></div>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  setTimeout(() => setId('SM-2'), 50);
  setTimeout(() => setShow(false), 100);
  setTimeout(() => {
    console.log('interval with stale closure:', document.getElementById('buggy').textContent,
                '| with updater:', Number(document.getElementById('fixed').textContent) > 5);
    window.__ready = true;
  }, 300);
</script>
```

Changing `id` cleaned up the old subscription before subscribing again; unmounting cleaned up the last one. The buggy ticker is stuck at 1: its effect ran once and captured `count = 0`, so every tick sets 0 + 1. The linter rule `react-hooks/exhaustive-deps` warns about exactly this; the updater form avoids depending on `count` at all.

> NOTE: In development, React 18's **Strict Mode** mounts every component twice (mount, unmount, mount) to expose effects that lack cleanup. If your effect breaks when run twice, it would also break when a user navigates away and back.

> TIP: Many effects are unnecessary. Values computed from props or state belong in the render (or `useMemo`), not in an effect that sets more state; responses to a click belong in the click handler. Effects are for synchronising with **external** systems.

## 8.5 Lists and keys

When rendering a list, each item needs a stable, unique `key` so that React can match old and new items. Using the array **index** as the key breaks when items are inserted, removed or reordered: React reuses the wrong component instances, and any state inside them (an input's text, a checkbox, an animation) stays with the position instead of the item.

```html run Index keys move state to the wrong row after an insertion
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  function Row({ name }) {
    const [note, setNote] = React.useState('');       // state that lives inside each row
    const onChange = e => setNote(e.target.value);
    return <li><b>{name}</b> <input value={note} onChange={onChange} /></li>;
  }
  function List({ useIndex, items }) {
    return <ul data-kind={useIndex ? 'index' : 'id'}>{items.map((it, i) =>
      <Row key={useIndex ? i : it.id} name={it.name} />)}</ul>;
  }
  function App() {
    const [items, setItems] = React.useState([{ id: 'b', name: 'Pune' },
                                              { id: 'c', name: 'Delhi' }]);
    window.prepend = () => setItems(xs => [{ id: 'a', name: 'Kolkata' }, ...xs]);
    return <div><List useIndex={true} items={items} />
                <List useIndex={false} items={items} /></div>;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  window.__ready = false;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const type = (input, text) => {           // simulate typing into a controlled input
    setValue.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const rowText = li =>
    `${li.querySelector('b').textContent}[${li.querySelector('input').value}]`;
  setTimeout(() => {
    for (const ul of document.querySelectorAll('ul'))
      type(ul.querySelector('input'), 'Pune note');
  }, 100);
  setTimeout(() => window.prepend(), 150);
  setTimeout(() => {
    for (const ul of document.querySelectorAll('ul'))
      console.log(`key=${ul.dataset.kind}:`,
                  [...ul.querySelectorAll('li')].map(rowText).join(' '));
    window.__ready = true;
  }, 200);
</script>
```

With index keys, the note typed for Pune now appears next to Kolkata, because the component at position 0 kept its state while its `name` prop changed. With id keys, the note stays with Pune. Use database ids or other stable ids; generate ids when items are created, never during render.

## 8.6 Forms: controlled inputs and validation

A **controlled** input takes its `value` from state and reports changes through `onChange`, so the state is the single source of truth: easy to validate, reset or prefill. (Uncontrolled inputs with `ref`s, or a library such as React Hook Form, suit large forms.)

```html run A controlled form with validation, disabled submit and submitted data
<!-- shot: fe_react_form.png 720x240 -->
<style>
  * { font-family: "DejaVu Sans", sans-serif; box-sizing: border-box; }
  label { display: block; margin: 8px 0 2px; font-size: 14px; }
  input { padding: 6px 8px; width: 260px; border: 1px solid #94a3b8; border-radius: 6px; }
  input[aria-invalid="true"] { border-color: #dc2626; }
  .err { color: #b91c1c; font-size: 13px; } button { margin-top: 12px; padding: 6px 14px; }
</style>
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  function validate({ serial, kwh }) {
    const e = {};
    if (!/^SM-\d{1,5}$/.test(serial)) e.serial = 'Use the format SM-123';
    if (kwh === '' || Number(kwh) < 0) e.kwh = 'Enter a reading of 0 or more';
    return e;
  }
  function ReadingForm({ onSave }) {
    const [values, setValues] = React.useState({ serial: '', kwh: '' });
    const [touched, setTouched] = React.useState({});
    const errors = validate(values);
    const change = e => setValues(v => ({ ...v, [e.target.name]: e.target.value }));
    const blur = e => setTouched(t => ({ ...t, [e.target.name]: true }));
    const submit = e => {
      e.preventDefault();
      onSave({ ...values, kwh: Number(values.kwh) });
    };
    const field = (name, label) => (
      <div>
        <label htmlFor={name}>{label}</label>
        <input id={name} name={name} value={values[name]} onChange={change} onBlur={blur}
               aria-invalid={Boolean(touched[name] && errors[name])} />
        {touched[name] && errors[name] && <div className="err">{errors[name]}</div>}
      </div>);
    return (
      <form onSubmit={submit}>
        {field('serial', 'Meter serial')}{field('kwh', 'Reading (kWh)')}
        <button disabled={Object.keys(errors).length > 0}>Save</button>
      </form>);
  }
  ReactDOM.createRoot(document.getElementById('root'))
    .render(<ReadingForm onSave={d => console.log('saved', JSON.stringify(d))} />);
  window.__ready = false;
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const type = (id, text) => {
    const el = document.getElementById(id);
    setValue.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  };
  setTimeout(() => { type('serial', 'meter 42'); type('kwh', '12.5'); }, 100);
  setTimeout(() => {
    console.log('button disabled:', document.querySelector('button').disabled,
                '| message:', document.querySelector('.err').textContent);
    type('serial', 'SM-42');
  }, 200);
  setTimeout(() => {
    console.log('button disabled:', document.querySelector('button').disabled);
    document.querySelector('button').click();
    type('serial', 'SM');                         // leave an error visible for the screenshot
  }, 300);
  setTimeout(() => { window.__ready = true; }, 350);
</script>
```

Errors appear only for fields the user has left (**touched**), not while they type their first character; the submit button stays disabled while any error exists; the submitted object has a number, not a string, for `kwh`. The screenshot shows the error state with `aria-invalid` styling.

## 8.7 Lifting state up and context

When two components need the same state, move it to their closest common parent and pass it down as props (**lifting state up**). When many distant components need it (the theme, the logged-in user, the language), passing props through every layer ("prop drilling") becomes noisy: **context** provides a value to an entire subtree.

```html run Context for the current user and theme, consumed deep in the tree
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  const SessionContext = React.createContext(null);
  function useSession() {
    const s = React.useContext(SessionContext);
    if (!s) throw new Error('useSession must be used inside <SessionProvider>');
    return s;
  }
  function SessionProvider({ children }) {
    const [theme, setTheme] = React.useState('light');
    const value = React.useMemo(() => ({ user: 'Meera', theme,
      toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) }), [theme]);
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
  }
  function Avatar() { const { user, theme } = useSession(); return <b>{user} ({theme})</b>; }
  function ThemeButton() {
    const { toggle } = useSession();
    return <button onClick={toggle}>toggle</button>;
  }
  const Header = () => <header><Avatar /> <ThemeButton /></header>;  // no props passed
  ReactDOM.createRoot(document.getElementById('root'))
    .render(<SessionProvider><Header /></SessionProvider>);
  setTimeout(() => {
    console.log(document.querySelector('b').textContent);
    document.querySelector('button').click();
    setTimeout(() => console.log(document.querySelector('b').textContent), 50);
  }, 100);
</script>
```

Every component that reads a context re-renders when its value changes, so keep contexts focused (separate ones for slowly and quickly changing data) and memoise the value object, as `useMemo` does above. For large, frequently changing client state, teams use a store library (Redux Toolkit, Zustand); for **server data** (lists fetched from APIs), a data-fetching library (TanStack Query, SWR) handles caching, refetching and loading states, which removes most hand-written effects.

## 8.8 Custom hooks and data fetching

A **custom hook** is a function whose name starts with `use` and which calls other hooks: it packages stateful logic for reuse. The rules of hooks: call them only at the top level of a component or hook (never in conditions or loops), because React identifies each hook by its call order.

```html run A useFetch hook with loading, error, retry and protection against stale responses
<div id="root"></div>
<script src="lib/react.js"></script><script src="lib/react-dom.js"></script>
<script src="lib/babel.js"></script>
<script type="text/babel">
  window.__ready = false;
  let calls = 0;
  const fakeApi = (city) => new Promise((resolve, reject) => {     // stands in for fetch
    calls++;
    const delay = city === 'Pune' ? 150 : 30;                       // Pune answers slowly
    const answer = () => (city === 'Nowhere'
      ? reject(new Error('HTTP 404'))
      : resolve([`${city}-meter-1`, `${city}-meter-2`]));
    setTimeout(answer, delay);
  });
  function useFetch(fn, arg) {
    const [state, setState] = React.useState({ status: 'loading' });
    const [attempt, setAttempt] = React.useState(0);
    React.useEffect(() => {
      let ignore = false;                // set if arg changes before the answer arrives
      setState({ status: 'loading' });
      fn(arg).then(data => !ignore && setState({ status: 'success', data }),
                   err => !ignore && setState({ status: 'error', message: err.message }));
      return () => { ignore = true; };
    }, [fn, arg, attempt]);
    return [state, () => setAttempt(a => a + 1)];
  }
  function Meters({ city }) {
    const [s, retry] = useFetch(fakeApi, city);
    if (s.status === 'loading') return <p>Loading {city}...</p>;
    if (s.status === 'error')
      return <p>Error: {s.message} <button onClick={retry}>Retry</button></p>;
    return <p>{s.data.join(', ')}</p>;
  }
  function App() { const [city, setCity] = React.useState('Pune'); window.setCity = setCity;
                   return <Meters city={city} />; }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  const show = (label) =>
    console.log(label.padEnd(26), document.querySelector('p').textContent);
  setTimeout(() => show('immediately:'), 0);
  setTimeout(() => setCity('Kolkata'), 20);        // the user switches before Pune answers
  setTimeout(() => show('after switching:'), 100);
  setTimeout(() => show('after Pune finally answers:'), 250);
  setTimeout(() => setCity('Nowhere'), 300);
  setTimeout(() => { show('bad city:'); console.log('requests made:', calls);
                     window.__ready = true; }, 400);
</script>
```

The slow Pune response arrived **after** the user had switched to Kolkata. Without the `ignore` flag it would have overwritten the Kolkata results with Pune's: a real race condition seen in search boxes and filters. The cleanup function marks the old request as stale (aborting it with an `AbortController` is even better, since it also saves bandwidth).

## 8.9 Practical lessons

- UI = f(state); never mutate state; use the updater form when the next value depends on the previous one.
- Re-renders are normal; memoise with `React.memo` + `useCallback`/`useMemo` only where measured, and only with stable props.
- Effects synchronise with external systems; always clean up; mind the dependency array and stale closures.
- Stable keys from data, never indexes for lists that change.
- Controlled inputs, validation on blur, disabled submit; lift state up, then context for app-wide values.
- Custom hooks package logic; protect against out-of-order responses; consider TanStack Query for server data.
