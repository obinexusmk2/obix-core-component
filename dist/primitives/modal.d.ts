/**
 * Modal primitive component
 * Dialog component with focus trap and accessibility support
 * Addresses focus trap failures and modal accessibility
 */
import type { ModalConfig, ComponentLogicWithAccessibility } from '../types.js';
/**
 * Creates a modal component with focus trap and accessibility features
 * - Focus trap implementation (prevents focus escape from modal)
 * - aria-modal and role="dialog" for accessibility
 * - Scroll lock when modal is open
 * - Escape key handler with configurable behavior
 * - Proper focus management on open/close
 *
 * @param config - Modal configuration
 * @returns Component logic for modal
 */
export declare function createModal(config: ModalConfig): ComponentLogicWithAccessibility;
/**
 * Utility function to find focusable elements within a container
 * Used for focus trap implementation
 *
 * @param container - Container element
 * @returns Array of focusable elements
 */
export declare function getFocusableElements(container: HTMLElement): HTMLElement[];
/**
 * Utility function to create a focus trap
 * Cycles focus back to first/last element when reaching boundaries
 *
 * @param container - Container element with focus trap
 * @param closeCallback - Function to call when escape is pressed
 */
export declare function createFocusTrap(container: HTMLElement, closeCallback?: () => void): {
    activate: () => void;
    deactivate: () => void;
};
//# sourceMappingURL=modal.d.ts.map