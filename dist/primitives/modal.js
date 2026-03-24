/**
 * Modal primitive component
 * Dialog component with focus trap and accessibility support
 * Addresses focus trap failures and modal accessibility
 */
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
export function createModal(config) {
    const { title = 'Dialog', ariaLabel = title, closeOnEscape = true, closeOnBackdropClick = true, scrollable = false, size = 'md', } = config;
    // Track initial focus element for restoration
    let previousFocusedElement = null;
    const state = {
        open: false,
        title,
        closeOnEscape,
        closeOnBackdropClick,
        scrollable,
        size,
        focusTrapped: false,
        scrollLocked: false,
    };
    const actions = {
        /**
         * Open the modal
         */
        open() {
            if (typeof document !== 'undefined') {
                previousFocusedElement = document.activeElement;
            }
            state.open = true;
            return {
                type: 'MODAL_OPENED',
                open: true,
                focusTrapped: true,
                scrollLocked: !scrollable,
            };
        },
        /**
         * Close the modal
         */
        close() {
            state.open = false;
            return {
                type: 'MODAL_CLOSED',
                open: false,
                focusTrapped: false,
                scrollLocked: false,
                restoreFocus: previousFocusedElement !== null,
            };
        },
        /**
         * Toggle modal open/close
         */
        toggle() {
            const isOpen = state.open;
            if (isOpen) {
                return actions.close();
            }
            else {
                return actions.open();
            }
        },
        /**
         * Handle escape key press
         */
        handleEscapeKey() {
            if (state.closeOnEscape) {
                return actions.close();
            }
            return { type: 'ESCAPE_KEY_IGNORED' };
        },
        /**
         * Handle backdrop click
         */
        handleBackdropClick() {
            if (state.closeOnBackdropClick) {
                return actions.close();
            }
            return { type: 'BACKDROP_CLICK_IGNORED' };
        },
    };
    const focusConfig = {
        trapFocus: true,
        restoreFocus: true,
        focusVisible: true,
    };
    const aria = {
        role: 'dialog',
        'aria-label': ariaLabel,
        'aria-modal': true,
        'aria-hidden': !state.open,
    };
    return {
        state,
        actions,
        aria,
        focusConfig,
        touchTarget: {
            minWidth: 44,
            minHeight: 44,
            padding: 0,
        },
    };
}
/**
 * Utility function to find focusable elements within a container
 * Used for focus trap implementation
 *
 * @param container - Container element
 * @returns Array of focusable elements
 */
export function getFocusableElements(container) {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    return Array.from(container.querySelectorAll(focusableSelectors));
}
/**
 * Utility function to create a focus trap
 * Cycles focus back to first/last element when reaching boundaries
 *
 * @param container - Container element with focus trap
 * @param closeCallback - Function to call when escape is pressed
 */
export function createFocusTrap(container, closeCallback) {
    let isActive = false;
    let handleKeyDown = null;
    return {
        activate() {
            if (isActive)
                return;
            isActive = true;
            handleKeyDown = (e) => {
                if (e.key === 'Escape' && closeCallback) {
                    closeCallback();
                    return;
                }
                if (e.key !== 'Tab')
                    return;
                const focusableElements = getFocusableElements(container);
                if (focusableElements.length === 0)
                    return;
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                const activeElement = document.activeElement;
                if (e.shiftKey) {
                    // Shift+Tab on first element → focus last element
                    if (activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                }
                else {
                    // Tab on last element → focus first element
                    if (activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            // Focus first focusable element
            const focusableElements = getFocusableElements(container);
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        },
        deactivate() {
            if (!isActive)
                return;
            isActive = false;
            if (handleKeyDown) {
                document.removeEventListener('keydown', handleKeyDown);
            }
        },
    };
}
//# sourceMappingURL=modal.js.map