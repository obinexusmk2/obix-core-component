# API reference

Full type surface of `@obinexusltd/obix-core-component`, from `src/types.ts`
and the primitive/policy modules that consume it. Everything listed is
exported from the package root (`src/index.ts`) via `export * from`.

## Core shared types (`src/types.ts`)

### `BaseComponentDef<S>`

```ts
interface BaseComponentDef<S = Record<string, unknown>>
  extends ComponentDefinition<S> {
  aria?: AriaAttributes;
  touchTarget?: TouchTarget;
  focusConfig?: FocusConfig;
  loadingState?: LoadingState;
  reducedMotionConfig?: ReducedMotionConfig;
}
```

Extends `ComponentDefinition<S>` from `@obinexusltd/obix-core` (type-only
import — see the Boundary note in the [README](../README.md) about this
not being a declared `peerDependency`). This is the shape every
`apply*Policy` function in `fud-mitigation.ts` operates on — see
[fud-mitigation-policies.md](fud-mitigation-policies.md).

### `AriaAttributes`

```ts
interface AriaAttributes {
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-busy'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-modal'?: boolean;
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
  [key: string]: unknown; // open index signature — any other aria-* is accepted untyped
}
```

### `TouchTarget`

```ts
interface TouchTarget { minWidth: number; minHeight: number; padding: number; }
```

WCAG 2.1 Level AAA calls for a 44×44px minimum — `applyTouchTargetPolicy`
enforces exactly that number (see
[fud-mitigation-policies.md](fud-mitigation-policies.md)).

### `FocusConfig`

```ts
interface FocusConfig { trapFocus: boolean; restoreFocus: boolean; focusVisible: boolean; }
```

### `ValidationState`

```ts
interface ValidationState { valid: boolean; errors: string[]; touched: boolean; }
```

Used by `createInput`'s `state.validation` — see
[button-and-input.md](button-and-input.md).

### `LoadingState`

```ts
interface LoadingState { loading: boolean; skeleton: boolean; interactive: boolean; }
```

### `ReducedMotionConfig`

```ts
interface ReducedMotionConfig {
  respectPreference: boolean;
  fallback: 'none' | 'fade' | 'instant';
}
```

### `ComponentLogicWithAccessibility<S>`

```ts
interface ComponentLogicWithAccessibility<S = Record<string, unknown>> {
  state: S;
  actions: Record<string, (...args: any[]) => any>;
  aria?: AriaAttributes;
  touchTarget?: TouchTarget;
  focusConfig?: FocusConfig;
}
```

The return type of all four `create*` primitive factories. Deliberately
**not** extending `ComponentLogic` from `@obinexusltd/obix-core` — the
type comment in `src/types.ts` explains this is so primitive `actions` can
have flexible signatures (varying parameter types, `undefined` returns)
that wouldn't satisfy the stricter core `Action` type.

### Per-primitive config types

```ts
interface ButtonConfig {
  label?: string; ariaLabel?: string; disabled?: boolean; loading?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary'; size?: 'sm' | 'md' | 'lg';
  isToggle?: boolean; ariaPressed?: boolean;
}

interface InputConfig {
  label?: string; ariaLabel?: string; placeholder?: string; disabled?: boolean;
  required?: boolean; type?: string; autocomplete?: string; ariaDescribedBy?: string;
  validationTiming?: 'onChange' | 'onBlur';
}

interface CardConfig {
  width?: number | string; height?: number | string; loading?: boolean;
  ariaLabel?: string; ariaLabelledBy?: string;
}

interface ModalConfig {
  title?: string; ariaLabel?: string; closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean; scrollable?: boolean; size?: 'sm' | 'md' | 'lg';
}
```

See [button-and-input.md](button-and-input.md) and
[card-and-modal.md](card-and-modal.md) for every field's effect and
default.

## Primitive factories

| Export | Signature | Doc |
|---|---|---|
| `createButton` | `(config: ButtonConfig) => ComponentLogicWithAccessibility` | [button-and-input.md](button-and-input.md) |
| `createInput` | `(config: InputConfig) => ComponentLogicWithAccessibility` | [button-and-input.md](button-and-input.md) |
| `createCard` | `(config: CardConfig) => ComponentLogicWithAccessibility` | [card-and-modal.md](card-and-modal.md) |
| `createModal` | `(config: ModalConfig) => ComponentLogicWithAccessibility` | [card-and-modal.md](card-and-modal.md) |
| `getFocusableElements` | `(container: HTMLElement) => HTMLElement[]` | [card-and-modal.md](card-and-modal.md) |
| `createFocusTrap` | `(container: HTMLElement, closeCallback?: () => void) => { activate(): void; deactivate(): void }` | [card-and-modal.md](card-and-modal.md) |

## Policy layer (`src/fud-mitigation.ts`)

| Export | Signature | Doc |
|---|---|---|
| `PolicyViolationError` | `class extends Error { policy: string }` | [fud-mitigation-policies.md](fud-mitigation-policies.md) |
| `applyAccessibilityPolicy` | `<S>(def: BaseComponentDef<S>) => BaseComponentDef<S>` | ″ |
| `applyTouchTargetPolicy` | `<S>(def: BaseComponentDef<S>) => BaseComponentDef<S>` | ″ |
| `applyReducedMotionPolicy` | `<S>(def: BaseComponentDef<S>) => BaseComponentDef<S>` | ″ |
| `applyFocusPolicy` | `<S>(def: BaseComponentDef<S>) => BaseComponentDef<S>` | ″ |
| `applyLoadingPolicy` | `<S>(def: BaseComponentDef<S>) => BaseComponentDef<S>` | ″ |
| `applyAllFudPolicies` | `<S>(def: BaseComponentDef<S>) => BaseComponentDef<S>` | ″ |
| `validateFudCompliance` | `<S>(def: BaseComponentDef<S>) => { compliant: boolean; violations: PolicyViolationError[]; warnings: string[] }` | ″ |

All six `apply*` functions **mutate their `def` argument in place** (they
set properties like `def.touchTarget` directly) and also return it —
`const same = applyTouchTargetPolicy(def); same === def` is `true`.
