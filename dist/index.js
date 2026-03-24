/**
 * OBIX Components - Accessibility-first, FUD-mitigating UI primitives
 *
 * This package provides base UI components that address common FUD (Fear, Uncertainty, Doubt)
 * concerns through accessibility-first design, proper touch targets, motion preferences,
 * and robust focus/loading state management.
 */
// Types and interfaces
export * from './types.js';
// Primitive components
export * from './primitives/button.js';
export * from './primitives/input.js';
export * from './primitives/card.js';
export * from './primitives/modal.js';
// FUD mitigation policies
export * from './fud-mitigation.js';
// Re-export key utilities from modal for focus management
export { createFocusTrap, getFocusableElements } from './primitives/modal.js';
//# sourceMappingURL=index.js.map