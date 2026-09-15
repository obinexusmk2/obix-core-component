# FUD mitigation policies

`src/fud-mitigation.ts` exports six `apply*` functions plus one read-only
`validateFudCompliance`. All six `apply*` functions **mutate their `def`
argument in place and also return it** — they are not pure.

```ts
class PolicyViolationError extends Error {
  constructor(public policy: string, message: string) {
    super(`[${policy}] ${message}`);
    this.name = 'PolicyViolationError';
  }
}
```

## `applyAccessibilityPolicy(def)`

1. If `def.aria` is missing, sets it to `{}` (so subsequent checks always
   have an object to read/write).
2. A role-presence heuristic: if `aria.role` is unset *and* some value in
   `def.state` literally equals one of `'button' | 'input' | 'dialog' |
   'region'`, logs a `console.warn`. In practice, none of this package's
   own `createButton`/`createInput`/`createCard`/`createModal` ever set a
   `state` value equal to one of those four strings (they use them as
   `aria.role`, not as state values) — this branch does not fire for the
   primitives shipped in this package; it only matters for hand-built
   `BaseComponentDef`s that happen to store one of those literal strings
   somewhere in `state`.
3. **The load-bearing check**: if `aria.role` is one of
   `'button' | 'dialog' | 'region'` and neither `aria-label` nor
   `aria-labelledby` is set, **throws** `PolicyViolationError`.
   (`'input'` is in the warn-heuristic list above but *not* in this throw
   list — an input with a role and no label doesn't throw here, only
   button/dialog/region do.)
4. If `def.state.validation` exists and `!validation.valid`: sets
   `aria['aria-invalid'] = true` if unset, and `console.warn`s if
   `aria-describedby` is also unset. Never throws for this case.
5. Returns `def` (now possibly mutated: `aria` created, `aria-invalid`
   possibly set).

## `applyTouchTargetPolicy(def)`

```ts
const MIN_TOUCH_WIDTH = 44;
const MIN_TOUCH_HEIGHT = 44;
```

If `def.touchTarget` exists and either dimension is below 44, **throws**
`PolicyViolationError`. If `def.touchTarget` is missing entirely, sets a
default (`{ minWidth: 44, minHeight: 44, padding: 8 }`) instead of
throwing — a missing touch target is treated as "fix it for them," an
undersized one is treated as "reject it."

## `applyReducedMotionPolicy(def)`

If `def.reducedMotionConfig` is missing, defaults it to
`{ respectPreference: true, fallback: 'fade' }`. If
`config.respectPreference` is true and `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
is true, branches on `config.fallback` (`'none' | 'instant' | 'fade'`) —
**but every branch is empty**. This function currently has no actual
effect beyond ensuring the config object exists; it does not modify
`def.state`, `def.aria`, or anything else based on the detected
preference. It never throws.

## `applyFocusPolicy(def)`

If `def.focusConfig` is missing, defaults it to
`{ trapFocus: false, restoreFocus: false, focusVisible: true }`. Warns
(does not throw) if `focusVisible` is `false`. Warns (does not throw) if
`trapFocus` is `true` but `aria.role` isn't one of
`'dialog' | 'menu' | 'listbox'`. Never throws — this function is
warn-only.

## `applyLoadingPolicy(def)`

If `def.loadingState` is missing, defaults it to
`{ loading: false, skeleton: false, interactive: true }`. If
`loadingState.skeleton` is true and `def.state` is an object: **throws**
`PolicyViolationError` if `state.height` is `"auto"` or falsy, and
separately **throws** if `state.width` is `"auto"` or falsy (the width
check runs after the height check, so a component missing both throws on
height first — the width throw is unreachable in that case since the
function has already thrown and returned).

## `applyAllFudPolicies(def)` — actual execution order

```ts
export function applyAllFudPolicies<S>(def: BaseComponentDef<S>): BaseComponentDef<S> {
  return applyReducedMotionPolicy(
    applyLoadingPolicy(
      applyFocusPolicy(applyTouchTargetPolicy(applyAccessibilityPolicy(def)))
    )
  );
}
```

Read as nested calls (innermost runs first), the actual order is:

1. `applyAccessibilityPolicy`
2. `applyTouchTargetPolicy`
3. `applyFocusPolicy`
4. `applyLoadingPolicy`
5. `applyReducedMotionPolicy`

Any throw short-circuits the rest — e.g. a component that fails the
touch-target check never reaches the focus/loading/reduced-motion steps.

## `validateFudCompliance(def)` — does **not** call the five functions above

```ts
function validateFudCompliance<S>(def: BaseComponentDef<S>): {
  compliant: boolean;
  violations: PolicyViolationError[];
  warnings: string[];
}
```

Despite the docstring ("Validates a component against all FUD mitigation
policies"), this function **reimplements a narrower, inline subset of the
checks** rather than calling `applyAccessibilityPolicy`/
`applyFocusPolicy`/`applyReducedMotionPolicy`/`applyLoadingPolicy`/
`applyTouchTargetPolicy` at all:

| What it actually checks | Matches the real policy function? |
|---|---|
| `!def.aria` → push a warning | Weaker than `applyAccessibilityPolicy` — doesn't check the role/label throw condition at all, just presence of `aria`. |
| `def.touchTarget` dimensions `< 44` → push a violation | Matches `applyTouchTargetPolicy`'s throw condition, but never applies the *default-if-missing* behavior — `validateFudCompliance` treats a missing `touchTarget` as passing (no violation), where `applyTouchTargetPolicy` would have silently filled in a compliant default. |
| `def.loadingState?.skeleton && !state.height` → push a violation | Matches `applyLoadingPolicy`'s height check; **does not check `state.width`** at all, unlike the real policy. |
| Focus policy | **Not checked at all.** No warning, no violation, regardless of `focusConfig`. |
| Reduced-motion policy | **Not checked at all** — moot today anyway since `applyReducedMotionPolicy`'s branches are empty (see above), but worth knowing this function doesn't even call it. |

Every check is wrapped in a `try { ... } catch (e) { if (e instanceof
PolicyViolationError) violations.push(e); }` block, but since none of the
code inside those `try` blocks ever actually throws (they push directly to
`violations`/`warnings` rather than calling the throwing `apply*`
functions), **the `catch` blocks are unreachable dead code** as currently
written.

### Practical implication

`validateFudCompliance(def).compliant === true` means def passed three
narrow, inline checks — it does not mean `def` would pass
`applyAllFudPolicies(def)` without throwing. In particular, an `def` with
an interactive `aria.role` (`button`/`dialog`/`region`) and no
`aria-label` will report `compliant: true` from `validateFudCompliance`
(only a warning, and only if `aria` is entirely missing — a `def` with
`aria: { role: 'button' }` and no label triggers no warning and no
violation here) while `applyAccessibilityPolicy(def)` would throw on the
exact same input. Don't use `validateFudCompliance` as a non-throwing
stand-in for "would `applyAllFudPolicies` succeed" — it currently checks a
different, smaller set of things.
