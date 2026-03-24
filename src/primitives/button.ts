/**
 * Button primitive component
 * WCAG-compliant button with proper ARIA attributes and loading state support
 */

import type {
  BaseComponentDef,
  ButtonConfig,
  ComponentLogicWithAccessibility,
} from '../types.js';

/**
 * Creates a button component with accessibility and FUD mitigation features
 * - Enforces minimum 44x44px touch target (WCAG 2.1 Level AAA)
 * - Includes aria-label and aria-pressed for toggle buttons
 * - Handles loading state with aria-busy
 * - Provides consistent action interface
 *
 * @param config - Button configuration
 * @returns Component logic for button
 */
export function createButton(config: ButtonConfig): ComponentLogicWithAccessibility {
  const {
    label = 'Button',
    ariaLabel = label,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'md',
    isToggle = false,
    ariaPressed = false,
  } = config;

  // Calculate touch target based on size
  const sizeMap = {
    sm: { width: 32, height: 32, padding: 8 },
    md: { width: 44, height: 44, padding: 12 },
    lg: { width: 56, height: 56, padding: 16 },
  };

  const baseSize = sizeMap[size];
  // Ensure minimum 44x44px touch target per WCAG
  const touchTarget = {
    minWidth: Math.max(baseSize.width, 44),
    minHeight: Math.max(baseSize.height, 44),
    padding: baseSize.padding,
  };

  const state: Record<string, unknown> = {
    label,
    disabled: disabled || loading,
    loading,
    variant,
    size,
    isToggle,
    pressed: ariaPressed,
  };

  const actions = {
    /**
     * Handle button click
     */
    click() {
      if (!state.disabled && !state.loading) {
        return { type: 'CLICKED' };
      }
    },

    /**
     * Toggle button state (for toggle buttons)
     */
    toggle() {
      if (state.isToggle && !state.disabled && !state.loading) {
        const nextPressed = !(state as Record<string, boolean>).pressed;
        (state as Record<string, boolean>).pressed = nextPressed;
        if (aria['aria-pressed'] !== undefined) {
          aria['aria-pressed'] = (state as Record<string, boolean>).pressed;
        }

        return {
          type: 'TOGGLED',
          pressed: (state as Record<string, boolean>).pressed,
        };
      }
    },

    /**
     * Set loading state
     */
    setLoading(loading: boolean) {
      return {
        type: 'LOADING_CHANGED',
        loading,
        disabled: loading || (state as Record<string, boolean>).disabled,
      };
    },

    /**
     * Set disabled state
     */
    setDisabled(disabled: boolean) {
      return {
        type: 'DISABLED_CHANGED',
        disabled: disabled || (state as Record<string, boolean>).loading,
      };
    },
  };

  const aria = {
    role: 'button',
    'aria-label': ariaLabel,
    'aria-busy': loading,
    'aria-disabled': disabled || loading,
    ...(isToggle && { 'aria-pressed': ariaPressed }),
  };

  return {
    state,
    actions,
    aria,
    touchTarget,
    focusConfig: {
      trapFocus: false,
      restoreFocus: false,
      focusVisible: true,
    },
  };
}
