/**
 * FUD (Fear, Uncertainty, Doubt) mitigation policies
 * Enforces accessibility standards, touch target sizing, reduced motion support,
 * focus management, and CLS prevention across all OBIX components
 */
import type { BaseComponentDef } from './types.js';
/**
 * Policy error type for validation failures
 */
export declare class PolicyViolationError extends Error {
    policy: string;
    constructor(policy: string, message: string);
}
/**
 * Applies accessibility policy to component definition
 * Ensures all components have proper ARIA attributes
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component lacks required accessibility attributes
 */
export declare function applyAccessibilityPolicy<S>(def: BaseComponentDef<S>): BaseComponentDef<S>;
/**
 * Applies touch target policy to component definition
 * Enforces minimum 44x44px touch targets per WCAG 2.1 Level AAA
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component touch target is too small
 */
export declare function applyTouchTargetPolicy<S>(def: BaseComponentDef<S>): BaseComponentDef<S>;
/**
 * Applies reduced motion policy to component definition
 * Wraps animations with prefers-reduced-motion media query support
 *
 * @param def - Component definition
 * @returns Modified component definition
 */
export declare function applyReducedMotionPolicy<S>(def: BaseComponentDef<S>): BaseComponentDef<S>;
/**
 * Applies focus policy to component definition
 * Ensures focus-visible support and removes outline:none without replacement
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component has outline:none without replacement
 */
export declare function applyFocusPolicy<S>(def: BaseComponentDef<S>): BaseComponentDef<S>;
/**
 * Applies loading policy to component definition
 * Ensures skeleton → interactive transition doesn't cause Cumulative Layout Shift
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component loading causes CLS
 */
export declare function applyLoadingPolicy<S>(def: BaseComponentDef<S>): BaseComponentDef<S>;
/**
 * Applies all FUD mitigation policies to a component definition
 * Ensures comprehensive accessibility, sizing, motion, focus, and loading state support
 *
 * @param def - Component definition
 * @returns Modified component definition with all policies applied
 * @throws PolicyViolationError if any policy is violated
 */
export declare function applyAllFudPolicies<S>(def: BaseComponentDef<S>): BaseComponentDef<S>;
/**
 * Validates a component against all FUD mitigation policies
 * Returns validation results without modifying the component
 *
 * @param def - Component definition
 * @returns Object with validation results and any violations
 */
export declare function validateFudCompliance<S>(def: BaseComponentDef<S>): {
    compliant: boolean;
    violations: PolicyViolationError[];
    warnings: string[];
};
//# sourceMappingURL=fud-mitigation.d.ts.map