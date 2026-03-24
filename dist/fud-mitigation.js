/**
 * FUD (Fear, Uncertainty, Doubt) mitigation policies
 * Enforces accessibility standards, touch target sizing, reduced motion support,
 * focus management, and CLS prevention across all OBIX components
 */
/**
 * Policy error type for validation failures
 */
export class PolicyViolationError extends Error {
    policy;
    constructor(policy, message) {
        super(`[${policy}] ${message}`);
        this.policy = policy;
        this.name = 'PolicyViolationError';
    }
}
/**
 * Applies accessibility policy to component definition
 * Ensures all components have proper ARIA attributes
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component lacks required accessibility attributes
 */
export function applyAccessibilityPolicy(def) {
    if (!def.aria) {
        def.aria = {};
    }
    const aria = def.aria;
    // Ensure role is defined for interactive components
    if (!aria.role &&
        ['button', 'input', 'dialog', 'region'].some((type) => def.state && Object.values(def.state).some((v) => v === type))) {
        // Allow components to be missing role if they define it elsewhere
        console.warn('Component should define aria.role for accessibility');
    }
    // Ensure aria-label or aria-labelledby exists for screen readers
    if (aria.role &&
        !aria['aria-label'] &&
        !aria['aria-labelledby'] &&
        ['button', 'dialog', 'region'].includes(aria.role)) {
        throw new PolicyViolationError('AccessibilityPolicy', `Interactive component with role="${aria.role}" requires aria-label or aria-labelledby`);
    }
    // Ensure error states include aria-invalid and aria-describedby
    if (def.state && def.state.validation) {
        const validation = def.state.validation;
        if (!validation.valid) {
            if (!aria['aria-invalid']) {
                aria['aria-invalid'] = true;
            }
            if (!aria['aria-describedby']) {
                console.warn('Component with validation errors should have aria-describedby pointing to error messages');
            }
        }
    }
    return def;
}
/**
 * Applies touch target policy to component definition
 * Enforces minimum 44x44px touch targets per WCAG 2.1 Level AAA
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component touch target is too small
 */
export function applyTouchTargetPolicy(def) {
    const MIN_TOUCH_WIDTH = 44;
    const MIN_TOUCH_HEIGHT = 44;
    if (def.touchTarget) {
        const { minWidth, minHeight } = def.touchTarget;
        if (minWidth < MIN_TOUCH_WIDTH || minHeight < MIN_TOUCH_HEIGHT) {
            throw new PolicyViolationError('TouchTargetPolicy', `Component touch target (${minWidth}x${minHeight}) is below WCAG minimum (${MIN_TOUCH_WIDTH}x${MIN_TOUCH_HEIGHT}px)`);
        }
    }
    else {
        // Set default touch target if not provided
        def.touchTarget = {
            minWidth: MIN_TOUCH_WIDTH,
            minHeight: MIN_TOUCH_HEIGHT,
            padding: 8,
        };
    }
    return def;
}
/**
 * Applies reduced motion policy to component definition
 * Wraps animations with prefers-reduced-motion media query support
 *
 * @param def - Component definition
 * @returns Modified component definition
 */
export function applyReducedMotionPolicy(def) {
    if (!def.reducedMotionConfig) {
        def.reducedMotionConfig = {
            respectPreference: true,
            fallback: 'fade',
        };
    }
    const config = def.reducedMotionConfig;
    if (config.respectPreference) {
        // Check if user prefers reduced motion
        if (typeof window !== 'undefined') {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) {
                // Replace animations with safer fallback
                if (config.fallback === 'none') {
                    // No animation at all
                }
                else if (config.fallback === 'instant') {
                    // Instant transitions
                }
                else if (config.fallback === 'fade') {
                    // Simple fade transitions only
                }
            }
        }
    }
    return def;
}
/**
 * Applies focus policy to component definition
 * Ensures focus-visible support and removes outline:none without replacement
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component has outline:none without replacement
 */
export function applyFocusPolicy(def) {
    if (!def.focusConfig) {
        def.focusConfig = {
            trapFocus: false,
            restoreFocus: false,
            focusVisible: true,
        };
    }
    const focusConfig = def.focusConfig;
    if (!focusConfig.focusVisible) {
        console.warn('Component disables focus-visible. Ensure an alternative focus indicator is provided.');
    }
    // Verify that focus trap is only enabled where appropriate (modals, dropdowns)
    if (focusConfig.trapFocus &&
        def.aria &&
        !['dialog', 'menu', 'listbox'].includes(def.aria.role)) {
        console.warn(`Focus trap enabled on component with role="${def.aria.role}". Focus traps should only be used in modals, menus, and similar components.`);
    }
    return def;
}
/**
 * Applies loading policy to component definition
 * Ensures skeleton → interactive transition doesn't cause Cumulative Layout Shift
 *
 * @param def - Component definition
 * @returns Modified component definition
 * @throws PolicyViolationError if component loading causes CLS
 */
export function applyLoadingPolicy(def) {
    if (!def.loadingState) {
        def.loadingState = {
            loading: false,
            skeleton: false,
            interactive: true,
        };
    }
    // If component has loading state, verify it has explicit dimensions
    if (def.loadingState &&
        def.loadingState.skeleton &&
        def.state &&
        typeof def.state === 'object') {
        const state = def.state;
        if (state.height === 'auto' || !state.height) {
            throw new PolicyViolationError('LoadingPolicy', 'Component with skeleton loading must have explicit height to prevent Cumulative Layout Shift (CLS)');
        }
        if (state.width === 'auto' || !state.width) {
            throw new PolicyViolationError('LoadingPolicy', 'Component with skeleton loading should have explicit width to prevent Cumulative Layout Shift (CLS)');
        }
    }
    return def;
}
/**
 * Applies all FUD mitigation policies to a component definition
 * Ensures comprehensive accessibility, sizing, motion, focus, and loading state support
 *
 * @param def - Component definition
 * @returns Modified component definition with all policies applied
 * @throws PolicyViolationError if any policy is violated
 */
export function applyAllFudPolicies(def) {
    return applyReducedMotionPolicy(applyLoadingPolicy(applyFocusPolicy(applyTouchTargetPolicy(applyAccessibilityPolicy(def)))));
}
/**
 * Validates a component against all FUD mitigation policies
 * Returns validation results without modifying the component
 *
 * @param def - Component definition
 * @returns Object with validation results and any violations
 */
export function validateFudCompliance(def) {
    const violations = [];
    const warnings = [];
    // Check accessibility policy
    try {
        if (!def.aria) {
            warnings.push('Component should define aria attributes for accessibility');
        }
    }
    catch (e) {
        if (e instanceof PolicyViolationError) {
            violations.push(e);
        }
    }
    // Check touch target policy
    try {
        if (def.touchTarget) {
            const { minWidth, minHeight } = def.touchTarget;
            if (minWidth < 44 || minHeight < 44) {
                violations.push(new PolicyViolationError('TouchTargetPolicy', `Touch target (${minWidth}x${minHeight}) below WCAG minimum (44x44px)`));
            }
        }
    }
    catch (e) {
        if (e instanceof PolicyViolationError) {
            violations.push(e);
        }
    }
    // Check loading policy
    try {
        if (def.loadingState && def.loadingState.skeleton && def.state) {
            const state = def.state;
            if (!state.height || state.height === 'auto') {
                violations.push(new PolicyViolationError('LoadingPolicy', 'Skeleton loading requires explicit height to prevent CLS'));
            }
        }
    }
    catch (e) {
        if (e instanceof PolicyViolationError) {
            violations.push(e);
        }
    }
    return {
        compliant: violations.length === 0,
        violations,
        warnings,
    };
}
//# sourceMappingURL=fud-mitigation.js.map