/**
 * Card primitive component
 * Container component with loading skeleton support and CLS prevention
 * Addresses Cumulative Layout Shift (CLS) concerns
 */
import type { CardConfig, ComponentLogicWithAccessibility } from '../types.js';
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
export declare function createCard(config: CardConfig): ComponentLogicWithAccessibility;
//# sourceMappingURL=card.d.ts.map