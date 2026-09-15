# `createButton` and `createInput`

## `createButton(config: ButtonConfig)`

### Sizing → touch target

```ts
const sizeMap = {
  sm: { width: 32, height: 32, padding: 8 },
  md: { width: 44, height: 44, padding: 12 },
  lg: { width: 56, height: 56, padding: 16 },
};
```

`touchTarget.minWidth`/`.minHeight` are `Math.max(baseSize.width/height,
44)` — so `size: "sm"` (nominally 32×32) is still reported with a 44×44
minimum touch target; only the `padding` value (`8`) passes through
unclamped from the size map. There's no way to get a `touchTarget` under
44×44 from `createButton` regardless of `size`.

### `state`

```ts
{ label, disabled: disabled || loading, loading, variant, size, isToggle, pressed: ariaPressed }
```

Note `disabled` in `state` is **not** the raw `config.disabled` — it's
`disabled || loading`, computed once at creation. If you later call
`actions.setLoading(true)`, `state.disabled` itself is **not** updated
(see the actions table below) — only the returned action descriptor
reflects the new combined disabled state.

### `actions`

| Action | Mutates `state`? | Updates `aria`? | Returns |
|---|---|---|---|
| `click()` | No | No | `{ type: "CLICKED" }` if `!state.disabled && !state.loading`, else `undefined` |
| `toggle()` | **Yes** — `state.pressed` | **Yes** — `aria['aria-pressed']`, but only if `isToggle` is true and the button isn't disabled/loading | `{ type: "TOGGLED", pressed }` on success, `undefined` if not a toggle button or disabled/loading |
| `setLoading(loading)` | No | No | `{ type: "LOADING_CHANGED", loading, disabled: loading \|\| state.disabled }` — a computed *next* disabled value, not applied to `state` |
| `setDisabled(disabled)` | No | No | `{ type: "DISABLED_CHANGED", disabled: disabled \|\| state.loading }` — same pattern |

`toggle()` is the **only** action, across all four primitives, that keeps
`aria` in sync with a mutation it makes to `state`. Every other action in
this package either doesn't touch `aria` at all, or doesn't touch `state`
either — see [state-and-aria-sync.md](state-and-aria-sync.md) for the full
picture.

### `aria`

```ts
{
  role: 'button',
  'aria-label': ariaLabel,
  'aria-busy': loading,
  'aria-disabled': disabled || loading,
  ...(isToggle && { 'aria-pressed': ariaPressed }),
}
```

`aria-pressed` is only present at all when `config.isToggle` is `true` —
a non-toggle button's `aria` object has no `aria-pressed` key.
`aria-busy`/`aria-disabled` are computed once from the initial
`config.loading`/`config.disabled` and never re-derived by `setLoading`/
`setDisabled` (both only return a descriptor — see the table above).

## `createInput(config: InputConfig)`

### `state`

```ts
{
  label, placeholder, disabled, required, type, autocomplete,
  value: '',
  validationTiming, // 'onBlur' by default
  validation: { valid: true, errors: [], touched: false },
}
```

`value` always starts as `''`, regardless of any config — there's no
`defaultValue`/`initialValue` field on `InputConfig`.

### Validation timing

`validationTiming` defaults to `"onBlur"`. It only changes what
`actions.change(value)` does:

- `"onChange"` — `change()` runs `validateInput` immediately and returns
  the fresh `validation` in its result.
- `"onBlur"` (default) — `change()` updates `value` but does **not**
  compute new `validation`; only `actions.blur()` or `actions.validate()`
  run `validateInput`.

In both modes, `change(value)` **does** mutate `state.value = value`
directly — this is one of the few actions in the package that writes
straight to `state`.

### `actions`

| Action | Mutates `state`? | Returns |
|---|---|---|
| `change(value)` | **Yes** — `state.value` | `{ type: "VALUE_CHANGED", value, validation }` — `validation` is freshly computed only if `validationTiming === "onChange"`; otherwise it's a shallow copy of the current (possibly stale) `state.validation` |
| `blur()` | No — computes a new `validation` but never assigns it to `state.validation` | `{ type: "BLURRED", validation }` with `errors`/`valid` freshly computed and `touched: true` |
| `focus()` | No | `{ type: "FOCUSED" }` |
| `clear()` | No — does not reset `state.value` | `{ type: "CLEARED", value: "", validation: { valid: true, errors: [], touched: <unchanged> } }` |
| `validate()` | No — same as `blur()`, computes but doesn't store | `{ type: "VALIDATED", validation }` |

**None of `blur()`, `clear()`, or `validate()` write back to
`state.validation` or `state.value`.** Calling `input.actions.clear()`
does not make `input.state.value` become `""` — it only returns an action
object saying it *should* become `""`. If you're driving a live UI off
`state` directly rather than dispatching these returned descriptors
through your own reducer, `blur`/`clear`/`validate`/`focus` will appear to
do nothing.

### `validateInput(value, config)` (internal, not exported)

```ts
if (config.required && value.trim() === '') errors.push('This field is required');
if (type === 'email' && value && !isValidEmail(value)) errors.push('Invalid email address');
if (type === 'url' && value && !isValidUrl(value)) errors.push('Invalid URL');
if (type === 'number' && value && isNaN(Number(value))) errors.push('Must be a valid number');
```

- The `required` check runs regardless of `type`; the other three are
  type-specific and only run when `value` is non-empty (an empty,
  non-required field never reports "invalid email", only "required" if
  applicable).
- `isValidEmail` is a simple regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), not a
  full RFC 5322 validator — good enough to catch obviously malformed
  input, not a complete email spec check.
- `isValidUrl` delegates to the real `URL` constructor in a try/catch —
  this is a solid, spec-accurate check (unlike the email regex).

### `aria`

```ts
{
  role: 'textbox',
  'aria-label': ariaLabel,
  'aria-invalid': !state.validation.valid, // always false at creation — validation.valid starts true
  ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
  'aria-required': required,
  'aria-disabled': disabled,
}
```

`aria-invalid` is computed once, from the *initial* `state.validation`
(always `valid: true` at creation, so `aria-invalid` always starts
`false`) — it is never recomputed after `blur()`/`validate()`/`change()`
determine the field is actually invalid. See
[state-and-aria-sync.md](state-and-aria-sync.md).
