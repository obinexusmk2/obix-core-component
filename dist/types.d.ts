/**
 * Base component type definitions for OBIX UI primitives
 * Addresses FUD (Fear, Uncertainty, Doubt) mitigation through accessibility-first design
 */
import type { ComponentDefinition } from '@obinexusltd/obix-core';
/**
 * Extended component definition that builds on the core ComponentDefinition pattern
 * Adds support for accessibility, state management, and FUD mitigation policies
 */
export interface BaseComponentDef<S = Record<string, unknown>> extends ComponentDefinition<S> {
    /** ARIA attributes for accessibility */
    aria?: AriaAttributes;
    /** Touch target sizing (WCAG compliance) */
    touchTarget?: TouchTarget;
    /** Focus management configuration */
    focusConfig?: FocusConfig;
    /** Loading and skeleton state support */
    loadingState?: LoadingState;
    /** Reduced motion animation configuration */
    reducedMotionConfig?: ReducedMotionConfig;
}
/**
 * Typed ARIA attribute map
 * Ensures proper accessibility support across all components
 */
export interface AriaAttributes {
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
    [key: string]: unknown;
}
/**
 * Touch target sizing configuration
 * Enforces WCAG minimum 44x44px touch targets to prevent FUD around mobile accessibility
 */
export interface TouchTarget {
    minWidth: number;
    minHeight: number;
    padding: number;
}
/**
 * Focus management configuration
 * Addresses focus trap failures and focus visibility issues
 */
export interface FocusConfig {
    /** Whether to trap focus within the component */
    trapFocus: boolean;
    /** Whether to restore focus when component closes */
    restoreFocus: boolean;
    /** Whether to show focus-visible indicator */
    focusVisible: boolean;
}
/**
 * Form validation state
 * Addresses form validation timing uncertainty
 */
export interface ValidationState {
    /** Whether the field is valid */
    valid: boolean;
    /** Array of error messages */
    errors: string[];
    /** Whether the field has been interacted with */
    touched: boolean;
}
/**
 * Component loading and skeleton state
 * Addresses Cumulative Layout Shift (CLS) concerns
 */
export interface LoadingState {
    /** Whether component is in loading state */
    loading: boolean;
    /** Whether to show skeleton placeholder */
    skeleton: boolean;
    /** Whether component is interactive during loading */
    interactive: boolean;
}
/**
 * Reduced motion animation configuration
 * Respects user preferences for reduced motion (prefers-reduced-motion)
 */
export interface ReducedMotionConfig {
    /** Whether to respect prefers-reduced-motion preference */
    respectPreference: boolean;
    /** Fallback animation style when motion is reduced */
    fallback: 'none' | 'fade' | 'instant';
}
/**
 * Base component logic type for all OBIX primitives
 * Ensures consistent action and state management across components
 *
 * Note: Defined locally (not extending ComponentLogic from core) to allow for
 * flexible action signatures that don't match the strict core Action type.
 * Primitives may return undefined, complex state updates, and various parameter types.
 */
export interface ComponentLogicWithAccessibility<S = Record<string, unknown>> {
    /** Current component state */
    state: S;
    /** Actions that can be performed on this component */
    actions: Record<string, (...args: any[]) => any>;
    /** ARIA attributes for accessibility */
    aria?: AriaAttributes;
    /** Touch target sizing (WCAG compliance) */
    touchTarget?: TouchTarget;
    /** Focus management configuration */
    focusConfig?: FocusConfig;
}
/**
 * Button-specific configuration
 */
export interface ButtonConfig {
    label?: string;
    ariaLabel?: string;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary';
    size?: 'sm' | 'md' | 'lg';
    isToggle?: boolean;
    ariaPressed?: boolean;
}
/**
 * Input-specific configuration
 */
export interface InputConfig {
    label?: string;
    ariaLabel?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    type?: string;
    autocomplete?: string;
    ariaDescribedBy?: string;
    validationTiming?: 'onChange' | 'onBlur';
}
/**
 * Card-specific configuration
 */
export interface CardConfig {
    width?: number | string;
    height?: number | string;
    loading?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}
/**
 * Modal-specific configuration
 */
export interface ModalConfig {
    title?: string;
    ariaLabel?: string;
    closeOnEscape?: boolean;
    closeOnBackdropClick?: boolean;
    scrollable?: boolean;
    size?: 'sm' | 'md' | 'lg';
}
//# sourceMappingURL=types.d.ts.map