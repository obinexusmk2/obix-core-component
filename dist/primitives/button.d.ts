/**
 * Button primitive component
 * WCAG-compliant button with proper ARIA attributes and loading state support
 */
import type { ButtonConfig, ComponentLogicWithAccessibility } from '../types.js';
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
export declare function createButton(config: ButtonConfig): ComponentLogicWithAccessibility;
//# sourceMappingURL=button.d.ts.map