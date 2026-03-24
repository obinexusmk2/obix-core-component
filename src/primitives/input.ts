/**
 * Input primitive component
 * Text input with validation, autocomplete, and accessibility support
 * Addresses "Autocomplete Attribute Neglect" and "Form Validation Timing" problems
 */

import type {
  InputConfig,
  ComponentLogicWithAccessibility,
  ValidationState,
} from '../types.js';

/**
 * Creates a text input component with accessibility and FUD mitigation features
 * - Includes autocomplete attribute support (addresses Autocomplete Attribute Neglect)
 * - Validation timing: onBlur by default (addresses Form Validation Timing problem)
 * - Provides aria-invalid and aria-describedby for error messages
 * - Consistent validation and state management
 *
 * @param config - Input configuration
 * @returns Component logic for input
 */
export function createInput(config: InputConfig): ComponentLogicWithAccessibility {
  const {
    label = '',
    ariaLabel = label,
    placeholder = '',
    disabled = false,
    required = false,
    type = 'text',
    autocomplete = 'off',
    ariaDescribedBy = '',
    validationTiming = 'onBlur',
  } = config;

  const state: Record<string, unknown> = {
    label,
    placeholder,
    disabled,
    required,
    type,
    autocomplete,
    value: '',
    validationTiming,
    validation: {
      valid: true,
      errors: [] as string[],
      touched: false,
    } as ValidationState,
  };

  const actions = {
    /**
     * Handle input change
     */
    change(value: string) {
      state.value = value;
      const validation = { ...(state.validation as ValidationState) };

      // If validation timing is onChange, validate immediately
      if (state.validationTiming === 'onChange') {
        validation.errors = validateInput(value, state as Record<string, unknown>);
        validation.valid = validation.errors.length === 0;
      }

      return {
        type: 'VALUE_CHANGED',
        value,
        validation,
      };
    },

    /**
     * Handle blur event (default validation point)
     */
    blur() {
      const validation = { ...(state.validation as ValidationState) };
      const value = state.value as string;

      validation.errors = validateInput(value, state as Record<string, unknown>);
      validation.valid = validation.errors.length === 0;
      validation.touched = true;

      return {
        type: 'BLURRED',
        validation,
      };
    },

    /**
     * Handle focus event
     */
    focus() {
      return { type: 'FOCUSED' };
    },

    /**
     * Clear input value
     */
    clear() {
      return {
        type: 'CLEARED',
        value: '',
        validation: {
          valid: true,
          errors: [] as string[],
          touched: (state.validation as ValidationState).touched,
        },
      };
    },

    /**
     * Validate input manually
     */
    validate() {
      const validation = { ...(state.validation as ValidationState) };
      const value = state.value as string;

      validation.errors = validateInput(value, state as Record<string, unknown>);
      validation.valid = validation.errors.length === 0;
      validation.touched = true;

      return {
        type: 'VALIDATED',
        validation,
      };
    },
  };

  const aria = {
    role: 'textbox',
    'aria-label': ariaLabel,
    'aria-invalid': !(state.validation as ValidationState).valid,
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
    'aria-required': required,
    'aria-disabled': disabled,
  };

  return {
    state,
    actions,
    aria,
    touchTarget: {
      minWidth: 44,
      minHeight: 44,
      padding: 8,
    },
    focusConfig: {
      trapFocus: false,
      restoreFocus: false,
      focusVisible: true,
    },
  };
}

/**
 * Validates input value based on configuration
 *
 * @param value - Input value to validate
 * @param config - Input configuration
 * @returns Array of error messages
 */
function validateInput(value: string, config: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (config.required && value.trim() === '') {
    errors.push('This field is required');
  }

  const type = config.type as string;
  if (type === 'email' && value && !isValidEmail(value)) {
    errors.push('Invalid email address');
  }

  if (type === 'url' && value && !isValidUrl(value)) {
    errors.push('Invalid URL');
  }

  if (type === 'number' && value && isNaN(Number(value))) {
    errors.push('Must be a valid number');
  }

  return errors;
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Simple URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
