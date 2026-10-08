# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| F1.1 | Classic scripts block; `defer` and modules run after parsing, in document order |
| F1.2 | `input.setCustomValidity(msg)` makes a field invalid until you set `''` |
| F1.3 | `header`, `nav`, `a`, `main`, `h1`, and `lang` on `html` |
| F1.4 | CSS and synchronous head scripts block; `media="print"`, `defer`, `font-display`, `loading="lazy"` |

## Part 2 hints

| Exercise | Hint |
|---|---|
| F2.1 | `:is()` takes the specificity of its most specific argument |
| F2.2 | `place-items: center`; `justify-content` + `align-items`; `top: 50%; left: 50%; translate(-50%, -50%)` |
| F2.3 | `grid-template-areas` and a media query that redefines the areas |
| F2.4 | `repeat(auto-fill, minmax(180px, 1fr))`; remember the gap |
| F2.5 | `transform` creates a stacking context |
| F2.6 | `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`; `-webkit-line-clamp: 2`; compare `scrollWidth`/`scrollHeight` with the client sizes |

## Part 3 hints

| Exercise | Hint |
|---|---|
| F3.1 | Scale the RGB channels down step by step until the ratio reaches 4.5 |
| F3.2 | Loading, empty, no results, error, partial failure, long content, selection, confirm, success |
| F3.3 | 16 × 1.2<sup>k</sup> for k = −2 … 4 |

## Part 4 hints

| Exercise | Hint |
|---|---|
| F4.1 | `+` with a string concatenates; `-` converts to numbers; `sort` compares strings |
| F4.2 | `JSON.stringify(args)` as the cache key; the memoised function must call itself through the memoised name |
| F4.3 | All microtasks, including ones queued by microtasks, run before the next timer |
| F4.4 | Count settled promises; store results by index |
| F4.5 | Retry on `TypeError`/`AbortError` and `status >= 500`; wait `base * 2 ** attempt` |
| F4.6 | Recurse on arrays and objects; compare key sets |
| F4.7 | Copy the handler list before calling handlers |

## Part 5 hints

| Exercise | Hint |
|---|---|
| F5.1 | `data-id` on each item; `closest('button.delete')` and `closest('li')` |
| F5.2 | Build text nodes and a `<mark>` element for the match |
| F5.3 | Only the selected tab has `tabindex="0"`; handle `keydown` on the tablist |
| F5.4 | Anything readable by scripts is exposed to XSS |

## Part 6 hints

| Exercise | Hint |
|---|---|
| F6.1 | `kind: 'circle' \| 'rect' \| 'triangle'`; `const _: never = s` in `default` |
| F6.2 | `items.map(it => it[key])` |
| F6.3 | Check `typeof x === 'object' && x !== null`, then each property's type |

## Part 7 hints

| Exercise | Hint |
|---|---|
| F7.1 | Keep the step as a number; clamp it |
| F7.2 | `const visible = todos.filter(...)` computed in render |
| F7.3 | `useEffect` with `setTimeout`, cleaned up on every change |
| F7.4 | An effect without dependencies runs after every render, and setting state renders again |
| F7.5 | Radio inputs with visually hidden circles give keyboard and semantics for free |

## Part 8 hints

| Exercise | Hint |
|---|---|
| F8.1 | `aria-label`, `alt`, a darker colour, `<html lang>` |
| F8.2 | CSS backgrounds are discovered late; image size; preload; compression; CDN |
| F8.3 | Replace `& < > " '` with entities |
| F8.4 | Anchor the regex: `^SM-[1-9]\d{0,4}$` |
