# How to use this practice book
%36 exercises matching the front-end guide, with hints kept separate and executed solutions

Each part matches chapters of the **Front-end Design and Development** guide. Many exercises are in the style of **machine-coding rounds**: build a small working component in 30–60 minutes. Write each solution as a single HTML file (or a JavaScript or TypeScript file), open it in a browser or run it with Node, and only then compare.

Solutions were executed like the guide: JavaScript with Node.js 22, TypeScript with `tsc --strict`, HTML (including React 18 compiled in the page by Babel) in headless Chromium, with clicks and typing simulated by the page's own script and the console output shown.

| Type | What you do |
|---|---|
| Code | Build and run it |
| Debug | Find and fix the bug |
| Concept | Explain, as in an interview |
| Numerical | Compute a value by hand |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For components, ✓ also requires: semantic elements, keyboard support, and no console errors. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | The browser and HTML | 4 |
| 2 | 3 | CSS | 6 |
| 3 | 4 | UI design | 3 |
| 4 | 5 | JavaScript | 7 |
| 5 | 6 | The DOM | 4 |
| 6 | 7 | TypeScript | 3 |
| 7 | 8 | React | 5 |
| 8 | 9–12 | Accessibility, performance, security, testing | 4 |

# Exercises

## Part 1: The browser and HTML

**F1.1 · Easy · Concept · Script loading.** A page has, in its head, `<script src="a.js">`, `<script defer src="b.js">`, `<script defer src="c.js">` and `<script type="module" src="d.js">`. In what order do they run relative to each other and to `DOMContentLoaded`? What would `async` change?

**F1.2 · Medium · Code · A sign-up form without a library.** Build a form with email, password (at least 8 characters) and confirm-password fields using only built-in validation, plus `setCustomValidity` for the "passwords must match" rule. Report each field's validity for a few inputs.

**F1.3 · Easy · Code · From div soup to semantics.** Rewrite this into semantic HTML and check it with axe: `<div class="top"><div class="logo">MeterHub</div><div class="menu"><div onclick="go('/')">Home</div></div></div><div class="content"><div class="title">Readings</div>...</div>`.

**F1.4 · Medium · Concept · Render-blocking resources.** Which of these block the first paint, and how would you stop each from blocking: a 200 KB stylesheet, a print stylesheet, a web font, a synchronous analytics script in the head, an image below the fold?

## Part 2: CSS

**F2.1 · Easy · Numerical · Specificity.** Give the specificity of `#nav a`, `.menu a:hover`, `nav ul li a`, `a.active`, `[data-x] a` and `:is(#nav, .menu) a`. Which colour does a link `<a class="active">` inside `<nav id="nav" class="menu">` get if each sets a different colour?

**F2.2 · Medium · Code · Centre it three ways.** Centre a 200 × 100 card in a 400 × 300 container using Grid, Flexbox and absolute positioning with `transform`, and verify all three positions numerically.

**F2.3 · Medium · Code · Holy-grail layout.** Build header, footer, a left nav, main content and a right aside with Grid; below 600 px, stack everything in one column with the nav after main. Check both widths.

**F2.4 · Medium · Code · A gallery without media queries.** Make a card grid that shows as many 180 px-minimum columns as fit. How many columns appear at 360, 720 and 1100 px?

**F2.5 · Medium · Debug · The modal behind the header.** A modal with `z-index: 9999` appears behind a sticky header with `z-index: 10`. The modal sits inside a container that has `transform: translateZ(0)` and `z-index: 1`. Explain and fix, proving which element is on top.

**F2.6 · Hard · Code · Truncation.** Show a long meter name on one line with an ellipsis, and a long description clamped to two lines, and detect in JavaScript whether each is truncated (to show a tooltip only when needed).

## Part 3: UI design

**F3.1 · Medium · Numerical · Fix a palette.** Text colours `#8a94a6` (secondary), `#3b82f6` (links) and white on `#22c55e` (success badge) are used on white. Which pass WCAG AA for normal text? Find the lightest darker shade of each hue that passes.

**F3.2 · Medium · Concept · States of a table.** List every state you would design for a "Meters" table that loads from an API, supports search and pagination, and lets users delete a meter.

**F3.3 · Easy · Numerical · A type scale.** With a 16 px base and ratio 1.2, give the sizes two steps down and four steps up, rounded to whole pixels, and explain why a scale beats picking sizes by eye.

## Part 4: JavaScript

**F4.1 · Easy · Code · Predict the output.** Predict, then run: `[] == false`, `null + 1`, `undefined + 1`, `'3' - '2'`, `'3' + 2 - 1`, `[1, 2] + [3]`, `typeof NaN`, `0.1 * 3`, `[10, 1, 3].sort()`, `!!'false'`.

**F4.2 · Medium · Code · Memoise.** Write `memoize(fn)` that caches results by argument list, and show with a slow Fibonacci that it turns exponential work into linear work.

**F4.3 · Medium · Code · Event-loop puzzle.** Predict the order of eight logs mixing `setTimeout`, `Promise.resolve().then`, `queueMicrotask`, `await` and synchronous code, including a timeout scheduled inside a microtask and a promise inside a timeout.

**F4.4 · Medium · Code · Promise.all from scratch.** Implement `promiseAll(iterable)` with the same behaviour: results in input order, rejection on the first failure, non-promise values allowed, and an empty input resolving immediately.

**F4.5 · Hard · Code · A resilient fetch.** Write `fetchWithRetry(url, { retries, timeoutMs })` with a per-attempt timeout (AbortController), exponential back-off, and retries only for network errors and 5xx responses. Test against a local server that fails twice with 503.

**F4.6 · Medium · Code · Copies and equality.** Show the difference between a spread copy and `structuredClone` on a nested object, then write `deepEqual(a, b)` for plain objects, arrays and primitives.

**F4.7 · Hard · Code · An event emitter.** Implement `on`, `off`, `once` and `emit` (with arguments), where `off` inside a handler and `once` behave correctly during the same `emit`.

## Part 5: The DOM

**F5.1 · Medium · Code · A to-do list in plain JavaScript.** Add items from a form, toggle done by clicking, delete with a button, all with **one** delegated listener; keep the data in an array and re-render from it.

**F5.2 · Medium · Code · Live search.** Filter a list of 500 cities as the user types, debounced at 150 ms, highlighting the matched part safely (no `innerHTML` with user input). Count how many times the filter actually ran for a typed word.

**F5.3 · Hard · Code · Accessible tabs.** Build tabs with `role="tablist"`, `tab` and `tabpanel`, `aria-selected`, roving `tabindex`, and Left/Right/Home/End keys.

**F5.4 · Easy · Concept · Where to store it.** For each, choose cookie, localStorage, sessionStorage, IndexedDB or "do not store in the browser": the session identifier; the chosen theme; a half-written form in one tab; 5,000 offline readings; a payment card number; a refresh token.

## Part 6: TypeScript

**F6.1 · Medium · Code · Exhaustive shapes.** Model circles, rectangles and triangles as a discriminated union with an exhaustive `area()` function. Then add a `hexagon` member without updating `area()` and show the compiler error.

**F6.2 · Medium · Code · A typed pluck.** Write `pluck<T, K extends keyof T>(items: T[], key: K): T[K][]`. Show the inferred result type and the error for a key that does not exist.

**F6.3 · Medium · Code · Validate at the boundary.** Write a type guard `isMeter(x: unknown): x is Meter` and use it to parse an untrusted JSON array, keeping valid items and counting rejected ones.

## Part 7: React

**F7.1 · Medium · Code · Counter with a step.** A counter with +/−, a numeric step input (1–10), a reset button, and − disabled at 0. Simulate a short session and print the displayed value.

**F7.2 · Medium · Code · Filtered to-dos.** Add, toggle and filter (All, Active, Done) to-dos, storing only the list and the filter in state and deriving the visible items and the "n left" counter.

**F7.3 · Hard · Code · useDebouncedValue.** Write a `useDebouncedValue(value, ms)` hook and use it to filter a list only after typing pauses. Count how many times the filter runs while typing a word.

**F7.4 · Medium · Debug · The runaway effect.** A component calls `setItems(data)` in an effect with no dependency array, where `data` is created during render. Explain why it loops, show the render count, and fix it.

**F7.5 · Hard · Code · Star rating.** Build a five-star rating component: click to set, hover to preview, arrow keys to change, exposed to assistive technology as a radio group, and calling `onChange` with the new value.

## Part 8: Accessibility, performance, security and testing

**F8.1 · Medium · Code · Fix what axe finds.** Run axe on a product card with an unlabelled icon button, an image without `alt`, low-contrast price text and a missing page language; fix all four and re-run.

**F8.2 · Medium · Concept · A slow LCP.** Lighthouse on a mid-range phone reports LCP 4.6 s for your landing page, whose hero is a 1.8 MB JPEG loaded through CSS `background-image`. List the likely causes and fixes in order of impact.

**F8.3 · Medium · Code · Escaping output.** Write `escapeHtml(s)` and show that, used in a template, it neutralises three XSS payloads; then explain why escaping is not enough inside `href` attributes and inline scripts.

**F8.4 · Medium · Code · Unit tests.** Write `isValidMeterSerial(s)` (format `SM-` followed by 1–5 digits, no leading zeros) and a `node:test` suite with good, bad and edge cases.
