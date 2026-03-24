/**
 * Card primitive component
 * Container component with loading skeleton support and CLS prevention
 * Addresses Cumulative Layout Shift (CLS) concerns
 */
/**
 * Creates a card component with skeleton loading and CLS prevention
 * - Loading skeleton support for graceful loading states
 * - Enforces explicit dimensions to prevent Cumulative Layout Shift (CLS)
 * - aria-busy support during loading state
 * - Smooth skeleton → loaded transition
 *
 * @param config - Card configuration
 * @returns Component logic for card
 */
export function createCard(config) {
    const { width = '100%', height = 'auto', loading = false, ariaLabel = 'Card', ariaLabelledBy = '', } = config;
    // Validate dimensions to prevent CLS
    const validatedWidth = normalizeDimension(width);
    const validatedHeight = normalizeDimension(height);
    if (height === 'auto' && !loading) {
        console.warn('Card height is "auto" which may cause Cumulative Layout Shift (CLS). Consider setting an explicit height.');
    }
    const state = {
        width: validatedWidth,
        height: validatedHeight,
        loading,
        showSkeleton: loading,
        loadingState: {
            loading,
            skeleton: loading,
            interactive: false,
        },
        content: null,
    };
    const actions = {
        /**
         * Start loading with skeleton
         */
        startLoading() {
            return {
                type: 'LOADING_STARTED',
                loading: true,
                showSkeleton: true,
                loadingState: {
                    loading: true,
                    skeleton: true,
                    interactive: false,
                },
            };
        },
        /**
         * Complete loading and show content
         */
        finishLoading(content) {
            return {
                type: 'LOADING_FINISHED',
                loading: false,
                showSkeleton: false,
                loadingState: {
                    loading: false,
                    skeleton: false,
                    interactive: true,
                },
                content,
            };
        },
        /**
         * Set content directly
         */
        setContent(content) {
            return {
                type: 'CONTENT_SET',
                content,
                loading: false,
                showSkeleton: false,
                loadingState: {
                    loading: false,
                    skeleton: false,
                    interactive: true,
                },
            };
        },
        /**
         * Update dimensions
         */
        setDimensions(w, h) {
            const newWidth = normalizeDimension(w);
            const newHeight = normalizeDimension(h);
            if (h === 'auto') {
                console.warn('Card height is "auto" which may cause Cumulative Layout Shift (CLS). Consider setting an explicit height.');
            }
            return {
                type: 'DIMENSIONS_SET',
                width: newWidth,
                height: newHeight,
            };
        },
    };
    const aria = {
        role: 'region',
        'aria-label': ariaLabel,
        'aria-busy': loading,
        ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy }),
    };
    return {
        state,
        actions,
        aria,
        touchTarget: {
            minWidth: 44,
            minHeight: 44,
            padding: 0,
        },
        focusConfig: {
            trapFocus: false,
            restoreFocus: false,
            focusVisible: false,
        },
    };
}
/**
 * Normalizes dimension values to pixel strings
 * Prevents invalid CSS values
 *
 * @param dimension - Width or height value
 * @returns Normalized dimension string
 */
function normalizeDimension(dimension) {
    if (typeof dimension === 'number') {
        return `${dimension}px`;
    }
    if (typeof dimension === 'string') {
        // Allow auto, 100%, or pixel values
        if (dimension === 'auto' || dimension.endsWith('%')) {
            return dimension;
        }
        // If it's a number string, ensure it has 'px'
        if (/^\d+$/.test(dimension)) {
            return `${dimension}px`;
        }
        return dimension;
    }
    return '100%';
}
//# sourceMappingURL=card.js.map