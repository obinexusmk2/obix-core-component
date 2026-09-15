# @obinexusltd/obix-core-component

Accessibility-first, FUD-mitigating UI primitives — `button`, `input`,
`card`, `modal` — plus a policy layer that enforces WCAG touch targets,
CLS-safe loading states, and reduced-motion fallbacks.

"FUD" here means **Fear, Uncertainty, Doubt**: specific, named accessibility
failure modes (missing touch targets, autocomplete neglect, validation
timing surprises, layout shift, broken focus traps) that this package
targets one at a time via its `apply*Policy` functions.

## The problem it owns

Each primitive (`createButton`, `createInput`, `createCard`, `createModal`)
returns a `ComponentLogicWithAccessibility`: a plain `{ state, actions,
aria, touchTarget, focusConfig }` bundle with sensible accessible defaults
baked in — a real WCAG-minimum touch target, a real `role`, sane focus
config. The `fud-mitigation` policies (`applyTouchTargetPolicy`,
`applyAccessibilityPolicy`, etc.) let you additionally *enforce* those
defaults on component definitions built elsewhere, throwing
`PolicyViolationError` when a definition falls below the bar (e.g. a touch
target under 44×44px).

## Install

```bash
npm install @obinexusltd/obix-core-component
```

Uses `ComponentDefinition` from `@obinexusltd/obix-core` as a type
dependency (see the Boundary section — it isn't currently declared as a
`peerDependency`).

## API

```ts
import {
  createButton, createInput, createCard, createModal,
  applyAccessibilityPolicy, applyTouchTargetPolicy, applyReducedMotionPolicy,
  applyFocusPolicy, applyLoadingPolicy, applyAllFudPolicies, validateFudCompliance,
  PolicyViolationError, getFocusableElements, createFocusTrap,
  type BaseComponentDef, type ComponentLogicWithAccessibility,
  type ButtonConfig, type InputConfig, type CardConfig, type ModalConfig,
  type AriaAttributes, type TouchTarget, type FocusConfig,
  type ValidationState, type LoadingState, type ReducedMotionConfig,
} from "@obinexusltd/obix-core-component";
```

| Export | Description |
|---|---|
| `createButton(config)` / `createInput(config)` / `createCard(config)` / `createModal(config)` | The four primitives. Each returns `{ state, actions, aria, touchTarget, focusConfig }`. See [docs/button-and-input.md](docs/button-and-input.md) and [docs/card-and-modal.md](docs/card-and-modal.md). |
| `apply*Policy(def)` (5 functions) | Mutate-and-return a `BaseComponentDef`, throwing `PolicyViolationError` on violations. See [docs/fud-mitigation-policies.md](docs/fud-mitigation-policies.md). |
| `applyAllFudPolicies(def)` | Runs all five, in a fixed order. |
| `validateFudCompliance(def)` | Read-only compliance check — **not** a full re-run of the five `apply*Policy` functions; see [docs/fud-mitigation-policies.md](docs/fud-mitigation-policies.md) for exactly what it does and doesn't check. |
| `getFocusableElements(container)` / `createFocusTrap(container, closeCallback?)` | Standalone focus-trap utilities, also re-exported for direct use outside `createModal`. |

See [docs/api-reference.md](docs/api-reference.md) for the full type
reference.

## Example

```ts
import { createButton, createInput, applyAllFudPolicies } from "@obinexusltd/obix-core-component";

const submit = createButton({ label: "Submit", variant: "primary" });
const email = createInput({ label: "Email", type: "email", required: true });

applyAllFudPolicies(submit);
applyAllFudPolicies(email);

const clicked = submit.actions.click(); // { type: "CLICKED" } — or undefined if disabled/loading
const blurred = email.actions.blur();   // { type: "BLURRED", validation: { valid, errors, touched: true } }
```

## Docs

- [docs/api-reference.md](docs/api-reference.md) — full type reference
- [docs/button-and-input.md](docs/button-and-input.md) — `createButton`/`createInput`: action semantics, validation timing, what mutates `state` vs. what only returns a descriptor
- [docs/card-and-modal.md](docs/card-and-modal.md) — `createCard`/`createModal`: CLS-safe dimensions, skeleton loading, the focus-trap implementation
- [docs/fud-mitigation-policies.md](docs/fud-mitigation-policies.md) — the five `apply*Policy` functions, `applyAllFudPolicies`'s actual execution order, and exactly what `validateFudCompliance` does (and doesn't) check
- [docs/state-and-aria-sync.md](docs/state-and-aria-sync.md) — the cross-cutting gotcha: `aria` is a one-time snapshot, not kept in sync with `state` by most actions

## Boundary

- **`aria` is computed once, at creation, and only two actions across all
  four primitives (`button.toggle`, and nothing else) update it
  afterward.** `state.value`/`state.open`/etc. can change via actions
  while the returned `aria` object silently goes stale (`aria-invalid`,
  `aria-busy`, `aria-hidden` in particular). See
  [docs/state-and-aria-sync.md](docs/state-and-aria-sync.md) — read this
  before wiring these primitives into a live UI.
- **`validateFudCompliance` does not call `applyAccessibilityPolicy`,
  `applyFocusPolicy`, or `applyReducedMotionPolicy`.** It reimplements a
  narrower, inline version of the accessibility and touch-target/loading
  checks and skips focus and reduced-motion validation entirely — despite
  its docstring ("Validates a component against all FUD mitigation
  policies"). See
  [docs/fud-mitigation-policies.md](docs/fud-mitigation-policies.md).
- **`@obinexusltd/obix-core` is imported for its `ComponentDefinition`
  type but is not listed in `package.json`'s `peerDependencies`** — worth
  adding before publishing, so consumers get a clear resolution error
  instead of a type-only import silently failing.
- Actions mostly return a Redux-style `{ type, ...changes }` descriptor
  rather than being the source of truth themselves — several *also*
  mutate the closed-over `state` object directly (`input.change`,
  `button.toggle`, `modal.open`/`close`), while others (`input.blur`,
  `input.validate`, `card.startLoading`) compute and return a next value
  without ever writing it back to `state`. This mixed pattern is
  documented per-action in
  [docs/button-and-input.md](docs/button-and-input.md) and
  [docs/card-and-modal.md](docs/card-and-modal.md) — don't assume every
  action call updates `state`.

MIT — OBINexus Computing
