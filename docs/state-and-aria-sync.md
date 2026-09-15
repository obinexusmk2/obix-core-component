# State and `aria` synchronization

This is the single most important cross-cutting fact about this package:
**the `aria` object returned by every `create*` primitive is a snapshot
computed once, at creation time.** Reading it later does not tell you the
component's current accessible state — only what it looked like when
`create*` was called. This page collects the pattern across all four
primitives so it's in one place instead of scattered across four docs.

## Why this matters

If you render UI by reading `component.aria` directly into DOM attributes
(e.g. `el.setAttribute('aria-busy', String(component.aria['aria-busy']))`)
once, and then call actions afterward expecting the same `component.aria`
object to reflect the new state, it won't — for three of the four
primitives, for almost every action.

## The full picture, per primitive

| Primitive | `aria` key | Set from | Updated by any action? |
|---|---|---|---|
| `createButton` | `aria-busy` | `config.loading` | No — `setLoading()` only returns a descriptor |
| `createButton` | `aria-disabled` | `config.disabled \|\| config.loading` | No — `setLoading()`/`setDisabled()` only return descriptors |
| `createButton` | `aria-pressed` | `config.ariaPressed` (only present if `isToggle`) | **Yes** — `toggle()` mutates `aria['aria-pressed']` directly |
| `createInput` | `aria-invalid` | `!state.validation.valid` (always `false` at creation) | No — `change()`/`blur()`/`validate()` never write back to `aria` or even to `state.validation` in the `blur`/`validate` case |
| `createInput` | `aria-disabled` | `config.disabled` | No — nothing changes `disabled` after creation |
| `createCard` | `aria-busy` | `config.loading` | No — `startLoading()`/`finishLoading()` only return descriptors |
| `createModal` | `aria-hidden` | `!state.open`, evaluated while `state.open` is still `false` | No — always `true`, forever, regardless of `open()`/`close()`. See [card-and-modal.md](card-and-modal.md#aria--the-most-consequential-staleness-case-in-this-package). |

`button.toggle()` is the **only** action in the entire package that keeps
an `aria` value in sync with a `state` mutation it performs.

## Why this is (probably) intentional, not just a bug

Every action's return value is a `{ type, ...changes }` descriptor — the
same shape a Redux/reducer action would have. The most consistent reading
of this design is: **these primitives are meant to be plugged into an
external state/rendering layer** (presumably `@obinexusltd/obix-core`'s
own component/reducer system, given `BaseComponentDef` extends its
`ComponentDefinition`) that takes each returned action, applies it to a
*real* reactive state store, and re-derives DOM attributes (including
`aria-*`) from that store on every update — rather than these primitive
factories owning live DOM/aria synchronization themselves.

That reading is consistent with the actions that *do* mutate `state`
directly (`input.change`, `button.toggle`, `modal.open`/`close`) looking
like incomplete/inconsistent leftovers rather than the intended pattern —
if the intended architecture is "dispatch the returned action to an
external store," none of the four primitives should be mutating their own
closed-over `state` at all, and the ones that do are arguably the
exception that needs fixing, not the no-mutation ones.

## What to do about it, practically

Until/unless this is resolved upstream, treat every `create*(...).aria`
object as **write-once, read-once** at the moment of creation:

- Don't hold onto `component.aria` and expect it to update. Re-derive the
  ARIA attributes you need from `component.state` plus the specific
  fields on each action's return value (e.g. `result.validation.valid`
  for input, `result.open` for modal), not from `component.aria`.
- If you need `state` itself to be current, note which actions actually
  mutate it (per the tables in
  [button-and-input.md](button-and-input.md) and
  [card-and-modal.md](card-and-modal.md)) — most don't, and rely on you
  applying the returned descriptor to your own store.
- Don't use `validateFudCompliance` as a signal that a component's `aria`
  is currently correct — it only checks whether `aria` is *present*, not
  whether it matches current `state` (and it has its own gaps — see
  [fud-mitigation-policies.md](fud-mitigation-policies.md)).
