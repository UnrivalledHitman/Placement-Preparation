# How to use this guide
%Front-end design and development, with every page rendered and every script run

The **front end** is everything that runs in the user's browser (or app): the structure (HTML), the presentation (CSS), the behaviour (JavaScript or TypeScript), usually organised with a framework such as React. **Front-end design** decides what the user sees and how it feels; **front-end development** builds it so that it is correct, fast, accessible and secure. Product companies interview for both: HTML/CSS layout questions, JavaScript fundamentals (closures, the event loop, promises), React state and effects, and "build this component" machine coding rounds.

## How the examples were run

Every block with a run label was executed for this book:

| Block | Executed by | What you see |
|---|---|---|
| JavaScript | Node.js 22 | The program's console output |
| TypeScript | The TypeScript compiler in `--strict` mode, then Node.js | Compiler errors exactly as `tsc` reports them, or the program's output |
| HTML (with CSS, JavaScript, React) | Headless Chromium (the engine of Chrome and Edge) | The page's `console.log` output and, where shown, a **screenshot** taken by the browser |

React examples load React 18 and compile JSX in the page with Babel, so each example is a single self-contained HTML file you can open in a browser. Real projects compile JSX ahead of time with a build tool (Chapter 12).

## How to study

1. Create a folder, save each HTML example as `page.html` and open it in Chrome. Open the **DevTools** (F12): the Elements, Console, Network and Performance panels are your microscope.
2. Change one thing at a time and predict the result before reloading.
3. Rebuild each React example from a blank file.
4. Solve the practice book. Its solutions are executed the same way.

## Map of the guide

| Chapter | Topic |
|---|---|
| 1 | What the front end is, where it runs, and how a browser turns bytes into pixels |
| 2 | HTML: semantics, forms and validation |
| 3 | CSS: cascade, box model, Flexbox, Grid, responsive design, theming |
| 4 | UI design: hierarchy, spacing, typography, colour and contrast, states, design systems |
| 5 | JavaScript: values, scope, closures, `this`, prototypes, the event loop, promises |
| 6 | The DOM and browser APIs: events, delegation, storage, fetch |
| 7 | TypeScript: types, narrowing, generics, utility types |
| 8 | React: components, state, effects, lists and keys, forms, context, custom hooks |
| 9 | Accessibility |
| 10 | Performance and Core Web Vitals |
| 11 | Front-end security |
| 12 | Tooling, testing, deployment and interview questions |

# Chapter 1: What the Front End Is
%Where it runs, how it talks to the back end, and how the browser renders a page

## 1.1 Front end, back end and where each runs

| | Front end | Back end |
|---|---|---|
| Runs on | The user's device: browser, mobile app, desktop app (Electron) | Servers you control (Chapter 1 of the Linux guide) |
| Languages | HTML, CSS, JavaScript/TypeScript (Kotlin/Swift on native mobile) | Java/Spring, Python, Node.js, Go ... |
| Responsible for | Layout, interaction, client-side validation, routing between screens, calling APIs, caching for speed | Business rules, authorisation, data storage, payments, integrations |
| Trust | **Untrusted**: the user controls the device and can change any code | Trusted: the only place to enforce rules |
| Delivered by | A **CDN** or static host serving HTML, CSS, JS and images | Application servers behind a load balancer |

The front end and back end meet at an **API** (usually JSON over HTTPS). For the smart-energy dashboard used in this series: the browser downloads the app from a CDN; the app calls `GET /api/meters` and `GET /api/forecast` on the Spring Boot back end; it draws charts and tables; when the user submits a meter reading, the front end validates the form for a fast response, and the back end validates it **again**, because front-end checks can be bypassed.

> TRAP: Never put secrets (API keys with write access, database passwords) or authorisation decisions only in front-end code. Anyone can open DevTools, read the bundle and call your API directly.

## 1.2 Rendering strategies

| Strategy | How | Good for | Trade-off |
|---|---|---|---|
| Static site | Pre-built HTML files on a CDN | Docs, marketing pages, blogs | Content changes need a rebuild |
| Server-side rendering (SSR) | The server builds HTML per request (Spring MVC + Thymeleaf, Next.js) | Fast first paint, SEO | Server load; interactivity needs JS anyway |
| Single-page application (SPA) | One HTML shell; JavaScript renders everything and calls APIs (React + Vite) | Rich, app-like dashboards | Slow first load if the bundle is large; SEO needs care |
| Hybrid (SSR + hydration, static generation, server components) | HTML first, then JavaScript takes over ("hydrates") | Most modern frameworks (Next.js, Remix, Astro) | More moving parts |

## 1.3 From URL to pixels: the critical rendering path

1. **DNS** lookup, **TCP** and **TLS** handshakes, then an HTTP request (Networks guide).
2. The HTML arrives and is **parsed** into the **DOM** (Document Object Model), a tree of nodes.
3. CSS is parsed into the **CSSOM**. CSS is **render-blocking**: the browser waits for it before painting, to avoid showing unstyled content.
4. A classic `<script>` **blocks parsing**: the parser stops, downloads and runs it, then continues. `defer` (run after parsing, in order) and `async` (run when downloaded) avoid this.
5. DOM + CSSOM → **render tree** (only visible elements) → **layout** (compute every box's position and size) → **paint** (fill pixels) → **composite** (combine layers on the GPU).
6. Later changes trigger the steps again: changing `color` repaints; changing `width` re-runs layout ("reflow"); changing `transform` or `opacity` can be done by the compositor alone, which is why smooth animations use those two properties.

```html run Watching the parser: a classic script blocks, defer waits for the whole document
<script>
  const count = () => document.querySelectorAll('p').length;
  console.log('1. first inline script: paragraphs so far =', count());
</script>
<script defer src="data:text/javascript,console.log('4. deferred: paragraphs =', count())">
</script>
<p>first paragraph</p>
<script>console.log('2. after the first paragraph: paragraphs =', count())</script>
<p>second paragraph</p>
<script>
  document.addEventListener('DOMContentLoaded', () => console.log('5. DOMContentLoaded'));
  window.addEventListener('load', () => console.log('6. load (images, styles, everything)'));
  console.log('3. last inline script: paragraphs =', count());
</script>
```

Each inline script sees only the part of the document parsed so far; the deferred script runs after parsing has finished but **before** `DOMContentLoaded`. Put scripts at the end of `<body>` or use `defer`, so the page is not blocked waiting for JavaScript.

## 1.4 Developer tools you will use daily

| Tool | Use |
|---|---|
| Elements panel | Inspect the DOM and the **computed** styles of any element; edit live |
| Console | Run JavaScript in the page; see errors |
| Network panel | Every request: status, size, timing, headers; throttle to "Slow 4G" |
| Performance / Lighthouse | Record rendering and scripting; audit performance, accessibility, SEO |
| Application panel | Cookies, localStorage, service workers, cache |
| React DevTools | The component tree, props, state, why something re-rendered |

# Chapter 2: HTML
%Semantic structure, forms, validation and the document head

## 2.1 Elements, attributes and the document

HTML describes **structure and meaning**, not appearance. An element is a start tag, content and an end tag (`<p>text</p>`); attributes add information (`<a href="/meters">`). A minimal document:

```html run A minimal, correct HTML document and what the browser builds from it
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Meter dashboard</title>
</head>
<body>
  <h1>Meter dashboard</h1>
  <p>Readings for <strong>SM-42</strong>.</p>
  <script>
    const walk = (node, depth) => {
      if (node.nodeType !== 1) return;
      console.log('  '.repeat(depth) + node.tagName.toLowerCase());
      for (const child of node.children) walk(child, depth + 1);
    };
    walk(document.documentElement, 0);
    console.log('title:', document.title, '| lang:', document.documentElement.lang);
  </script>
</body>
</html>
```

| Line | Why it matters |
|---|---|
| `<!doctype html>` | Standards mode. Without it, browsers use "quirks mode" with old, inconsistent layout rules |
| `<html lang="en">` | Screen readers choose the right pronunciation; translation tools and search engines use it |
| `<meta charset="utf-8">` | Text (₹, Hindi, emoji) is decoded correctly |
| `<meta name="viewport" ...>` | Without it, phones render the page at desktop width and shrink it: the single most important line for mobile |
| `<title>` | The tab name, bookmarks, the search result headline |

## 2.2 Semantic elements

Use the element that **means** what the content is. Browsers, screen readers, search engines and your teammates all benefit.

| Element | Meaning |
|---|---|
| `<header>`, `<nav>`, `<main>`, `<footer>` | Page landmarks: screen-reader users jump between them |
| `<article>`, `<section>`, `<aside>` | A self-contained item; a thematic group with a heading; related side content |
| `<h1>` … `<h6>` | Headings: one `<h1>` per page, no skipped levels; they form the outline |
| `<button>` | An action. Focusable and keyboard-operable by default |
| `<a href>` | Navigation to another URL |
| `<ul>`/`<ol>`/`<li>`, `<table>` | Lists; tabular data (never for layout) |
| `<label>` | Names a form control |
| `<img alt>` | An image with a text alternative (`alt=""` for decoration) |

> TRAP: `<div onclick="...">Save</div>` looks like a button but is not one: it cannot be reached with Tab, Enter and Space do nothing, and a screen reader announces it as plain text. Use `<button>`; it is free. Chapter 9 measures this with an automated checker.

```html run A button versus a div pretending to be one: keyboard focus
<button id="real">Save (button)</button>
<div id="fake" onclick="console.log('clicked')">Save (div)</div>
<a href="#readings">Readings (link)</a>
<script>
  for (const el of document.querySelectorAll('#real, #fake, a')) {
    el.focus();
    console.log(`${el.id || 'link'}: focusable = ${document.activeElement === el}, ` +
                `tabIndex = ${el.tabIndex}`);
  }
</script>
```

The `div` cannot receive focus (tab index −1), so keyboard users can never activate it.

## 2.3 Forms and built-in validation

Forms collect input. The browser provides typed inputs (`email`, `number`, `date`, `tel`), mobile keyboards to match, and **constraint validation** with no JavaScript: `required`, `min`, `max`, `minlength`, `pattern`, `type`. The **Constraint Validation API** (`checkValidity()`, `validity`, `setCustomValidity()`) lets scripts read and extend it.

```html run Built-in constraint validation, read from JavaScript
<form id="reading" novalidate>
  <label>Meter serial <input name="serial" required pattern="SM-[0-9]{1,5}"></label>
  <label>Reading (kWh)
    <input name="kwh" type="number" min="0" max="10000" step="0.1" required></label>
  <label>Email for receipt <input name="email" type="email"></label>
  <button>Submit</button>
</form>
<script>
  const f = document.getElementById('reading');
  const tryValues = (serial, kwh, email) => {
    f.serial.value = serial; f.kwh.value = kwh; f.email.value = email;
    const problems = [...f.elements].filter(e => e.name && !e.checkValidity())
      .map(e => `${e.name}: ${Object.keys(ValidityState.prototype)
        .filter(k => k !== 'valid' && e.validity[k]).join(',')}`);
    const verdict = problems.length ? problems.join(' | ') : 'valid';
    console.log(JSON.stringify([serial, kwh, email]), '->', verdict);
  };
  tryValues('', '', '');
  tryValues('SM-42', '-3', 'priya@');
  tryValues('meter42', '12.34', 'priya@example.com');
  tryValues('SM-42', '12.3', 'priya@example.com');
</script>
```

The validity flags name exactly what failed: `valueMissing`, `patternMismatch`, `rangeUnderflow`, `typeMismatch`, `stepMismatch` (12.34 is not a multiple of the 0.1 step). `novalidate` turned off the browser's own pop-up messages so the script could report instead; without it, the browser blocks submission and shows a message on the first invalid field.

> NOTE: Client-side validation is for the **user's convenience** (instant feedback). The server must validate everything again (the Spring Boot guide's `@Valid`), because a request can be sent without your form at all.

## 2.4 The head: SEO, sharing and resources

```text
<meta name="description" content="Live readings and demand forecasts for your smart meters.">
<meta property="og:title" content="Meter dashboard">   <!-- link previews in chat apps -->
<meta property="og:image" content="https://cdn.example.com/og.png">
<link rel="canonical" href="https://app.example.com/meters">
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://api.example.com">  <!-- start the TLS handshake early -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/app.css">
<script type="module" src="/app.js"></script>           <!-- modules are deferred -->
```

## 2.5 Practical lessons

- Always: doctype, `lang`, `charset`, viewport, `title`.
- Choose elements for meaning: `button` for actions, `a` for navigation, landmarks and a heading outline.
- Use typed inputs and constraint attributes; read failures through `validity`; validate again on the server.
- Scripts block parsing unless `defer`, `async` or `type="module"`.
