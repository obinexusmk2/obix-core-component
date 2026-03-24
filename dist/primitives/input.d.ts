/**
 * Input primitive component
 * Text input with validation, autocomplete, and accessibility support
 * Addresses "Autocomplete Attribute Neglect" and "Form Validation Timing" problems
 */
import type { InputConfig, ComponentLogicWithAccessibility } from '../types.js';
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
export declare function createInput(config: InputConfig): ComponentLogicWithAccessibility;
//# sourceMappingURL=input.d.ts.map