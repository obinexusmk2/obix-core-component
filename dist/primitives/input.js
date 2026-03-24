/**
 * Input primitive component
 * Text input with validation, autocomplete, and accessibility support
 * Addresses "Autocomplete Attribute Neglect" and "Form Validation Timing" problems
 */
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
export function createInput(config) {
    const { label = '', ariaLabel = label, placeholder = '', disabled = false, required = false, type = 'text', autocomplete = 'off', ariaDescribedBy = '', validationTiming = 'onBlur', } = config;
    const state = {
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
            errors: [],
            touched: false,
        },
    };
    const actions = {
        /**
         * Handle input change
         */
        change(value) {
            state.value = value;
            const validation = { ...state.validation };
            // If validation timing is onChange, validate immediately
            if (state.validationTiming === 'onChange') {
                validation.errors = validateInput(value, state);
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
            const validation = { ...state.validation };
            const value = state.value;
            validation.errors = validateInput(value, state);
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
                    errors: [],
                    touched: state.validation.touched,
                },
            };
        },
        /**
         * Validate input manually
         */
        validate() {
            const validation = { ...state.validation };
            const value = state.value;
            validation.errors = validateInput(value, state);
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
        'aria-invalid': !state.validation.valid,
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
function validateInput(value, config) {
    const errors = [];
    if (config.required && value.trim() === '') {
        errors.push('This field is required');
    }
    const type = config.type;
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
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/**
 * Simple URL validation
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=input.js.map