# Chapter 3: CSS
%The cascade, the box model, Flexbox, Grid, responsive design and theming

## 3.1 Selectors and the cascade

A CSS rule is a **selector** and a block of **declarations**: `button.primary { background: #1d4ed8; }`. When several rules set the same property on an element, the **cascade** decides, in this order:

1. **Origin and importance**: `!important` declarations beat normal ones; author styles beat browser defaults.
2. **Specificity** of the selector, compared as three numbers (A, B, C): A = ID selectors, B = classes, attributes and pseudo-classes (`:hover`), C = element types and pseudo-elements. Higher A wins; ties go to B, then C. Inline `style=""` beats any selector.
3. **Order**: the later rule wins.

Some properties (`color`, `font-*`, `line-height`) are **inherited** by children; most (`margin`, `border`, `background`) are not.

```html run Which rule wins? The browser's computed colour
<style>
  p { color: gray; }                      /* (0,0,1) */
  .note { color: green; }                 /* (0,1,0) */
  p.note { color: teal; }                 /* (0,1,1) */
  #intro { color: blue; }                 /* (1,0,0) */
  .note.note.note { color: orange; }      /* (0,3,0): classes never beat one ID */
  .later { color: purple; }
  .later2 { color: brown; }               /* same specificity as .later, comes after */
  .forced { color: red !important; }
</style>
<p id="t1">plain paragraph</p>
<p id="t2" class="note">.note</p>
<p id="intro" class="note">#intro.note</p>
<p id="t4" class="later later2">.later.later2</p>
<p id="t5" class="note forced" style="color: black">inline style versus !important</p>
<div style="color: darkgreen"><span id="t6">inherited by a span</span></div>
<script>
  for (const el of document.querySelectorAll('p, span'))
    console.log(`${el.textContent.padEnd(32)} -> ${getComputedStyle(el).color}`);
</script>
```

The `.note.note.note` rule (specificity 0,3,0) still loses to `#intro` (1,0,0), and `!important` beats even the inline style. In practice: keep specificity low and flat (one class per rule, as in BEM or utility CSS), avoid IDs in selectors, and treat `!important` as a smell.

## 3.2 The box model

Every element is a box: **content**, then **padding**, then **border**, then **margin** (outside, transparent). By default (`box-sizing: content-box`), `width` sets only the content, so padding and border are **added** to it. With `box-sizing: border-box`, `width` includes padding and border, which is what designers mean by "a 200 px card". Nearly every project sets `*, *::before, *::after { box-sizing: border-box; }`.

```html run content-box versus border-box, measured by the browser
<style>
  .box { width: 200px; padding: 20px; border: 5px solid #334155; margin: 10px; }
  #a { box-sizing: content-box; }
  #b { box-sizing: border-box; }
  .gap { margin: 30px 0; height: 10px; background: #cbd5e1; }
</style>
<div id="a" class="box">content-box</div>
<div id="b" class="box">border-box</div>
<div class="gap" id="g1"></div><div class="gap" id="g2"></div>
<script>
  for (const id of ['a', 'b']) {
    const r = document.getElementById(id).getBoundingClientRect();
    const cs = getComputedStyle(document.getElementById(id));
    console.log(`${id}: rendered width ${r.width}px, content width ${cs.width}`);
  }
  const g1 = document.getElementById('g1').getBoundingClientRect();
  const g2 = document.getElementById('g2').getBoundingClientRect();
  console.log(`vertical gap between two blocks with 30px margins: ${g2.top - g1.bottom}px`);
</script>
```

The content-box element renders 250 px wide (200 + 2 × 20 padding + 2 × 5 border). The last line shows **margin collapsing**: adjacent vertical margins of blocks merge into the larger one (30 px), not their sum (60 px). It does not happen in Flexbox or Grid containers.

## 3.3 Display, positioning and stacking

| `display` | Behaviour |
|---|---|
| `block` | Starts on a new line, takes the full width (`div`, `p`, `section`) |
| `inline` | Flows inside text; `width`/`height` ignored (`span`, `a`, `strong`) |
| `inline-block` | Flows inline but accepts width and height |
| `flex`, `grid` | Lays out its **children** (Sections 3.4 and 3.5) |
| `none` | Removed from layout entirely (unlike `visibility: hidden`, which keeps the space) |

| `position` | Placed relative to |
|---|---|
| `static` | Normal flow (default) |
| `relative` | Its normal position, nudged by `top/left`; becomes a reference for absolute children |
| `absolute` | The nearest **positioned** ancestor; removed from flow |
| `fixed` | The viewport (stays on screen while scrolling) |
| `sticky` | Normal flow until a scroll threshold, then sticks (table headers, navbars) |

`z-index` orders overlapping positioned elements, but only **within the same stacking context**. A new stacking context is created by `position` + `z-index`, `opacity < 1`, `transform`, and others; a child with `z-index: 9999` can never escape a parent whose context sits below a sibling. "My modal is behind the header even with z-index 9999" is almost always this.

## 3.4 Flexbox: one-dimensional layout

`display: flex` lays children in a row (or a column with `flex-direction: column`). The container controls distribution along the **main axis** (`justify-content`) and alignment on the **cross axis** (`align-items`); `gap` sets spacing. Children control growth: `flex: 1` = grow to share free space equally.

```html run A navigation bar and equal-height cards with Flexbox
<!-- shot: fe_flex.png 720x300 -->
<style>
  * { box-sizing: border-box; font-family: "DejaVu Sans", sans-serif; }
  body { margin: 0; padding: 16px; background: #f8fafc; }
  nav { display: flex; align-items: center; gap: 16px; padding: 12px 16px;
        background: #1e293b; color: white; border-radius: 8px; }
  nav .brand { font-weight: bold; margin-right: auto; }   /* pushes the links to the right */
  nav a { color: #cbd5e1; text-decoration: none; }
  .cards { display: flex; gap: 16px; margin-top: 16px; }
  .card { flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 8px;
          padding: 16px; }
  .card h3 { margin: 0 0 8px; font-size: 15px; } .card p { margin: 0; color: #475569; }
</style>
<nav><span class="brand">⚡ MeterHub</span><a href="#">Meters</a><a href="#">Forecast</a>
  <a href="#">Billing</a></nav>
<div class="cards">
  <div class="card"><h3>Today</h3><p>412 kWh</p></div>
  <div class="card"><h3>Peak</h3><p>18:30, 61 kW. A longer description makes this card
    taller, yet all three stay the same height.</p></div>
  <div class="card"><h3>Forecast</h3><p>+6% tomorrow</p></div>
</div>
<script>
  const cards = [...document.querySelectorAll('.card')];
  const hs = cards.map(c => c.getBoundingClientRect().height);
  console.log('card heights:', hs.join(', '), '| widths equal:',
    new Set(cards.map(c => c.offsetWidth)).size === 1);
</script>
```

`margin-right: auto` on the brand absorbs the free space, a common trick. Cards stretch to the tallest one because `align-items` defaults to `stretch`.

## 3.5 Grid: two-dimensional layout

`display: grid` defines rows **and** columns. `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))` creates as many columns of at least 160 px as fit, sharing leftover space (`fr` = fraction of free space): a responsive gallery with no media queries. **Named areas** describe whole page layouts readably.

```html run A dashboard layout with named grid areas
<!-- shot: fe_grid.png 720x320 -->
<style>
  * { box-sizing: border-box; font-family: "DejaVu Sans", sans-serif; }
  body { margin: 0; padding: 12px; }
  .page { display: grid; gap: 10px; height: 290px;
          grid-template-columns: 160px 1fr 1fr;
          grid-template-rows: 48px 1fr 1fr;
          grid-template-areas: "side head head" "side chart chart" "side table alerts"; }
  .page > div { border-radius: 8px; padding: 10px; color: #0f172a; font-weight: bold; }
  .head { grid-area: head; background: #bfdbfe; }
  .side { grid-area: side; background: #e2e8f0; }
  .chart { grid-area: chart; background: #bbf7d0; }
  .table { grid-area: table; background: #fde68a; }
  .alerts { grid-area: alerts; background: #fecaca; }
</style>
<div class="page">
  <div class="head">header</div><div class="side">sidebar</div><div class="chart">chart</div>
  <div class="table">table</div><div class="alerts">alerts</div>
</div>
<script>
  for (const c of ['head', 'side', 'chart', 'table', 'alerts']) {
    const r = document.querySelector('.' + c).getBoundingClientRect();
    console.log(`${c.padEnd(7)} x=${r.x} y=${r.y} w=${r.width} h=${r.height}`);
  }
</script>
```

The 1fr columns split the remaining width equally: (720 − 2 × 12 padding − 160 − 2 × 10 gaps) / 2 = 258 px each, which is exactly what the browser computed.

> TIP: Flexbox for one direction (a toolbar, a row of buttons, centring one thing); Grid for two directions (page layouts, galleries, forms with aligned labels). They combine freely: a grid of cards whose insides are flex columns.

## 3.6 Responsive design

The same page must work from a 360 px phone to a 1920 px monitor.

- **Mobile first**: write the base styles for small screens, then add `@media (min-width: 768px) { ... }` for wider ones.
- Fluid units: `%`, `fr`, `vw`, and `rem` (relative to the root font size, so the whole UI scales when a user enlarges text). Use `clamp(1rem, 2.5vw, 1.5rem)` for fluid type.
- Images: `max-width: 100%; height: auto;`, and `srcset`/`sizes` so phones download small files.
- Container queries (`@container (min-width: 400px)`) style a component by the size of **its container**, not the viewport.

```html run One stylesheet, two viewport widths
<style>
  .grid { display: grid; gap: 8px; grid-template-columns: 1fr; }
  @media (min-width: 600px) { .grid { grid-template-columns: repeat(3, 1fr); } }
  .grid div { background: #e0e7ff; padding: 8px; }
</style>
<div class="grid"><div>A</div><div>B</div><div>C</div></div>
<iframe id="phone" style="width: 360px; height: 200px; border: 0"></iframe>
<script>
  const doc = document.documentElement.outerHTML.replace(/<iframe[\s\S]*$/, '</body></html>');
  const phone = document.getElementById('phone');
  phone.srcdoc = doc;
  phone.onload = () => {
    const cols = (d) => d.defaultView.getComputedStyle(d.querySelector('.grid'))
      .gridTemplateColumns.split(' ').length;
    console.log(`page ${innerWidth}px wide: ${cols(document)} columns`);
    console.log(`phone frame ${phone.contentWindow.innerWidth}px wide: ` +
                `${cols(phone.contentDocument)} column(s)`);
  };
</script>
```

The same CSS gives three columns at 720 px and one inside a 360 px frame, because a media query inside an iframe responds to the iframe's own width.

## 3.7 Custom properties and theming

CSS **custom properties** (variables) are declared on an element, inherited by its descendants, and read with `var()`. A theme is a set of variables; dark mode swaps them, either from the operating-system setting (`prefers-color-scheme`) or from a toggle that sets an attribute.

```html run A light and a dark theme from the same components
<!-- shot: fe_theme.png 720x200 -->
<style>
  :root { --bg: #ffffff; --fg: #0f172a; --muted: #64748b; --accent: #2563eb;
          --card: #f1f5f9; }
  [data-theme="dark"] { --bg: #0f172a; --fg: #e2e8f0; --muted: #94a3b8; --accent: #60a5fa;
                        --card: #1e293b; }
  * { box-sizing: border-box; font-family: "DejaVu Sans", sans-serif; }
  body { margin: 0; display: flex; }
  .pane { flex: 1; padding: 16px; background: var(--bg); color: var(--fg); height: 200px; }
  .card { background: var(--card); border-radius: 10px; padding: 14px; }
  .card small { color: var(--muted); } .card b { color: var(--accent); font-size: 22px; }
  button { margin-top: 10px; background: var(--accent); color: var(--bg); border: 0;
           padding: 8px 14px; border-radius: 6px; }
</style>
<div class="pane" data-theme="light"><div class="card"><small>Today</small><br>
  <b>412 kWh</b><br><button>Details</button></div></div>
<div class="pane" data-theme="dark"><div class="card"><small>Today</small><br>
  <b>412 kWh</b><br><button>Details</button></div></div>
<script>
  for (const p of document.querySelectorAll('.pane'))
    console.log(p.dataset.theme, '--accent =',
                getComputedStyle(p).getPropertyValue('--accent'));
</script>
```

## 3.8 Transitions and animations

`transition: transform 200ms ease-out` animates a property change; `@keyframes` defines multi-step animations. Animate `transform` and `opacity` (compositor only, smooth even on slow phones) rather than `width`, `top` or `margin` (layout on every frame). Respect `@media (prefers-reduced-motion: reduce)` for users who get motion sickness.

## 3.9 Practical lessons

- Specificity (IDs, classes, elements) then order; keep selectors flat; avoid `!important`.
- Set `box-sizing: border-box` globally; remember vertical margins collapse in normal flow.
- Flexbox for rows or columns, Grid for two-dimensional layouts; `gap` instead of margins.
- Mobile first with `min-width` media queries, `rem` units, fluid images; container queries for components.
- Themes are sets of custom properties; animate only `transform` and `opacity`.

# Chapter 4: UI Design for Developers
%Hierarchy, spacing, typography, colour and contrast, states, and design systems

## 4.1 What front-end design is

UI design decides **what** appears on screen and **how it feels to use**; UX design covers the whole journey (research, flows, information architecture). A front-end engineer is expected to turn a design (usually a **Figma** file) into code faithfully, and to make sensible design decisions when the design is silent: an empty state, a long name, an error, a narrow phone. The principles below cover most of those decisions.

## 4.2 Visual hierarchy

Users scan before they read. Make the most important thing the most prominent, through **size**, **weight**, **colour and contrast**, **position** (top-left first in left-to-right languages) and **space** around it. One primary action per screen (a filled button); secondary actions are outlined or text buttons; destructive actions are red and ask for confirmation.

## 4.3 Spacing and alignment

Use a **spacing scale** instead of arbitrary values: multiples of 4 or 8 px (4, 8, 12, 16, 24, 32, 48, 64). Related items sit closer together than unrelated ones (the **law of proximity**): a label is nearer its input than the previous field. Align everything to a few vertical lines. Generous white space looks more professional than borders and boxes.

## 4.4 Typography

- Two font families at most (often one), with a **type scale**: each size a fixed ratio above the previous (for example 1.25: 12.8, 16, 20, 25, 31.25 px).
- Body text 16 px or more; line height about 1.5 for body text, 1.2 for headings; line length 45–75 characters (`max-width: 65ch`).
- Use weight and size for hierarchy, not underlines (underline means link) or ALL CAPS paragraphs.
- Numbers in tables: `font-variant-numeric: tabular-nums` so digits line up.

```js run Generating a type scale and a spacing scale
const base = 16, ratio = 1.25;
const names = ['small', 'body', 'h4', 'h3', 'h2', 'h1'];
names.forEach((n, i) => {
  const px = base * ratio ** (i - 1);
  console.log(`${n.padEnd(6)} ${px.toFixed(2).padStart(6)}px = ${(px / 16).toFixed(3)}rem`);
});
console.log('spacing:', [0.5, 1, 1.5, 2, 3, 4, 6, 8].map(k => `${k * 8}px`).join(' '));
```

## 4.5 Colour and contrast

A palette needs a neutral scale (greys for text, borders, backgrounds), one **primary** (brand, primary actions) and **semantic** colours (success green, warning amber, danger red, info blue), each in several shades. Never use colour **alone** to carry meaning (about 1 in 12 men has a colour-vision deficiency): pair it with an icon or text ("▲ 6%", "Error: ...").

Text must contrast enough with its background. **WCAG** defines the contrast ratio from relative luminance L of the two colours: (L<sub>light</sub> + 0.05) / (L<sub>dark</sub> + 0.05), from 1 (none) to 21 (black on white). Level **AA** requires at least **4.5:1** for normal text and **3:1** for large text (24 px, or 18.66 px bold) and for UI components such as input borders.

```js run Computing WCAG contrast ratios for a palette
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const pairs = [['#000000', '#ffffff'], ['#64748b', '#ffffff'], ['#94a3b8', '#ffffff'],
               ['#ffffff', '#2563eb'], ['#ffffff', '#60a5fa'], ['#e2e8f0', '#0f172a']];
for (const [fg, bg] of pairs) {
  const r = ratio(fg, bg);
  const verdict = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large text only' : 'fail';
  console.log(`${fg} on ${bg}: ${r.toFixed(2)}:1  ${verdict}`);
}
```

The popular light grey `#94a3b8` on white fails even the large-text threshold, and white text on the light blue `#60a5fa` fails too: two choices that look fine on a designer's bright monitor and are unreadable on a phone in sunlight. Check every text colour pair; browser DevTools show the ratio in the colour picker.

## 4.6 Every component has states

A design that shows only the "happy" state is incomplete. For each component, design and build:

| State | Example for a meter list |
|---|---|
| Loading | Skeleton rows, not a blank screen; keep the layout stable |
| Empty | "No meters yet" with a button to add one |
| Error | What failed, and a Retry button; keep any data already shown |
| Partial / long content | Long names truncated with a tooltip; 10,000 rows paginated or virtualised |
| Interactive | Hover, **focus** (always visible: never `outline: none` without a replacement), active, disabled |
| Success | Confirmation after saving; optimistic update with rollback on failure |

```html run Button states, including a visible keyboard focus ring
<!-- shot: fe_states.png 720x120 -->
<style>
  body { font-family: "DejaVu Sans", sans-serif; display: flex; gap: 12px;
         align-items: center; }
  button { font: inherit; padding: 10px 18px; border-radius: 8px;
           border: 2px solid transparent; background: #2563eb; color: white; }
  button.hover { background: #1d4ed8; }
  button:focus-visible, button.focus { outline: 3px solid #f59e0b; outline-offset: 2px; }
  button:disabled { background: #cbd5e1; color: #475569; cursor: not-allowed; }
  button.secondary { background: white; color: #2563eb; border-color: #2563eb; }
  button.danger { background: #dc2626; }
  span { font-size: 12px; color: #475569; display: block; text-align: center;
         margin-top: 4px; }
</style>
<div><button>Save</button><span>default</span></div>
<div><button class="hover">Save</button><span>hover</span></div>
<div><button class="focus">Save</button><span>keyboard focus</span></div>
<div><button disabled>Save</button><span>disabled</span></div>
<div><button class="secondary">Cancel</button><span>secondary</span></div>
<div><button class="danger">Delete</button><span>destructive</span></div>
```

## 4.7 Design systems

A **design system** is the shared source of truth for a product's UI: **design tokens** (colours, spacing, type, radii, shadows as named variables, Section 3.7), **components** (Button, Input, Modal, Table, each with its states and accessibility built in), patterns (forms, empty states) and guidelines, mirrored in Figma and in code (often a component library documented in Storybook). Examples: Google's Material Design, IBM Carbon, Atlassian, Shopify Polaris. Using one gives consistency and speed; building one is a senior responsibility.

## 4.8 From Figma to code: a checklist

1. Read the design's **tokens** first (colours, type scale, spacing); create them as CSS variables before any component.
2. Identify the components and their variants; build from the smallest (Button) upwards.
3. Build the layout with Flex and Grid, using `gap` from the spacing scale; never hard-code pixel positions.
4. Ask for or decide the missing states (Section 4.6) and the breakpoints.
5. Check contrast, focus order and keyboard use; test at 360 px and at 200% zoom.
6. Compare with the design side by side (overlay tools exist); match spacing within a pixel or two.

## 4.9 Practical lessons

- Hierarchy through size, weight, contrast, position and space; one primary action per screen.
- Spacing and type from scales; 16 px body text; 45–75 characters per line.
- Contrast 4.5:1 for text (3:1 for large text and controls); never colour alone.
- Design every state: loading, empty, error, long content, focus, disabled.
- Tokens + components + guidelines = a design system.
