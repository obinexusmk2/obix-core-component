# `createCard` and `createModal`

## `createCard(config: CardConfig)`

### Dimension normalization (CLS prevention)

```ts
function normalizeDimension(dimension: number | string): string {
  if (typeof dimension === 'number') return `${dimension}px`;
  if (typeof dimension === 'string') {
    if (dimension === 'auto' || dimension.endsWith('%')) return dimension;
    if (/^\d+$/.test(dimension)) return `${dimension}px`;
    return dimension; // e.g. "10rem", "calc(100% - 2px)" pass through unchanged
  }
  return '100%';
}
```

`width`/`height` default to `'100%'`/`'auto'` respectively. A numeric
string of bare digits (`"300"`) gets `px` appended; a percentage or
`"auto"` passes through as-is; anything else (a CSS `calc()`, a `rem`
value) passes through unchanged too — `normalizeDimension` only
special-cases the ambiguous "bare number" case, not general CSS unit
parsing.

**`height: "auto"` triggers a `console.warn`** at creation time — but only
when `loading` is `false`:

```ts
if (height === 'auto' && !loading) {
  console.warn('Card height is "auto" which may cause Cumulative Layout Shift (CLS)...');
}
```

The reasoning: a card that's still loading is presumably about to get an
explicit height once content arrives, so the warning is suppressed during
the loading phase and only fires for a card that's claiming to be settled
(`loading: false`) with no explicit height.

### `state`

```ts
{
  width: <normalized>, height: <normalized>, loading, showSkeleton: loading,
  loadingState: { loading, skeleton: loading, interactive: false },
  content: null,
}
```

### `actions`

| Action | Mutates `state`? | Returns |
|---|---|---|
| `startLoading()` | No | `{ type: "LOADING_STARTED", loading: true, showSkeleton: true, loadingState: {...} }` |
| `finishLoading(content)` | No | `{ type: "LOADING_FINISHED", loading: false, showSkeleton: false, loadingState: {...}, content }` |
| `setContent(content)` | No | `{ type: "CONTENT_SET", content, loading: false, showSkeleton: false, loadingState: {...} }` |
| `setDimensions(w, h)` | No | `{ type: "DIMENSIONS_SET", width: <normalized>, height: <normalized> }` — also re-warns if `h === "auto"` (note: only checks the raw `h === "auto"`, not a `"100%"`-style value) |

None of `createCard`'s actions mutate `state` — every one is a pure
descriptor return, unlike `createButton`/`createInput`/`createModal`
which each mutate `state` in at least one action. If you're reading
`card.state` directly rather than dispatching these action objects
through your own store, none of `startLoading`/`finishLoading`/
`setContent`/`setDimensions` will visibly change anything.

### `aria`

```ts
{ role: 'region', 'aria-label': ariaLabel, 'aria-busy': loading, ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy }) }
```

`aria-busy` is fixed at creation from `config.loading` and never updated
by `startLoading()`/`finishLoading()` — same staleness pattern as the
other primitives; see
[state-and-aria-sync.md](state-and-aria-sync.md).

## `createModal(config: ModalConfig)`

### `state`

```ts
{ open: false, title, closeOnEscape, closeOnBackdropClick, scrollable, size, focusTrapped: false, scrollLocked: false }
```

Always starts `open: false` — there's no `initialOpen`/`defaultOpen`
config option.

### `actions`

| Action | Mutates `state`? | Returns |
|---|---|---|
| `open()` | **Yes** — `state.open = true`. Also records `document.activeElement` into a closure variable `previousFocusedElement` (no-op under SSR: guarded by `typeof document !== 'undefined'`) | `{ type: "MODAL_OPENED", open: true, focusTrapped: true, scrollLocked: !scrollable }` |
| `close()` | **Yes** — `state.open = false` | `{ type: "MODAL_CLOSED", open: false, focusTrapped: false, scrollLocked: false, restoreFocus: previousFocusedElement !== null }` |
| `toggle()` | Delegates entirely to `open()`/`close()` based on current `state.open` | Whatever the delegated call returns |
| `handleEscapeKey()` | Delegates to `close()` iff `state.closeOnEscape` | `close()`'s result, or `{ type: "ESCAPE_KEY_IGNORED" }` |
| `handleBackdropClick()` | Delegates to `close()` iff `state.closeOnBackdropClick` | `close()`'s result, or `{ type: "BACKDROP_CLICK_IGNORED" }` |

`open()`/`close()` do mutate `state.open` directly — but note the `aria`
object (below) is never touched by either, despite `aria-hidden` being
directly derived from `open`/closed status conceptually.

### `aria` — the most consequential staleness case in this package

```ts
const aria = {
  role: 'dialog',
  'aria-label': ariaLabel,
  'aria-modal': true,
  'aria-hidden': !state.open, // evaluated once, at creation, while state.open is still false
};
```

Because `state.open` is `false` at the point this object literal is
built, **`aria-hidden` is always `true` in the object `createModal`
returns — for the entire lifetime of that returned object, including
after `actions.open()` sets `state.open = true`.** There is no code path
in this file that ever sets `aria['aria-hidden'] = false`. For a modal —
a component whose core accessibility contract is "hidden from assistive
tech until open" — this means the `aria` object alone cannot be trusted
to reflect open/closed state; something consuming this primitive must
derive `aria-hidden` from `state.open` itself (or from the returned
action's `open` field) rather than from `modal.aria['aria-hidden']`.

### `focusConfig`

```ts
{ trapFocus: true, restoreFocus: true, focusVisible: true }
```

Fixed — `ModalConfig` has no field to override any of these three; every
modal created by this factory has `trapFocus`/`restoreFocus` on.

## Standalone focus-trap utilities

`createModal` doesn't call these itself — `getFocusableElements` and
`createFocusTrap` are separate, exported utilities (also re-exported at
the top level of `src/index.ts`) meant to be wired up by whatever renders
the modal.

### `getFocusableElements(container)`

```ts
const focusableSelectors = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'textarea:not([disabled])', 'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
```

A plain `container.querySelectorAll(...)` — no visibility check (a
`display: none` or `visibility: hidden` element matching the selector is
still returned), no `disabled`-via-`aria-disabled` handling (only the
native `disabled` attribute is excluded).

### `createFocusTrap(container, closeCallback?)`

Returns `{ activate(), deactivate() }`. `activate()`:

1. No-ops (returns immediately) if already active — safe to call twice.
2. Registers one `keydown` listener on `document`.
3. Inside that listener: `Escape` calls `closeCallback` (if provided) and
   returns, without checking `container` at all — this fires globally,
   not just when focus is inside `container`. Any other non-`Tab` key is
   ignored. On `Tab`: wraps focus at the boundaries exactly like
   [obix-core-a11y](../../obix-core-a11y)'s focus trap does — `Shift+Tab`
   on the first focusable element wraps to the last, `Tab` on the last
   wraps to the first. Tabbing in the middle of the container is left to
   native behavior.
4. Immediately focuses the first focusable element in `container`, if any.

`deactivate()` removes the listener and resets `isActive`; it does **not**
restore focus to whatever was focused before `activate()` — that's a
separate concern this utility doesn't handle (the `previousFocusedElement`
tracking in `createModal`'s `open()`/`close()` is a parallel, unconnected
mechanism — `createFocusTrap` and `createModal`'s own focus bookkeeping do
not call into each other).
