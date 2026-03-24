/**
 * Comprehensive test suite for OBIX components
 * Tests accessibility, touch targets, FUD mitigation policies, and component behavior
 */

import { describe, it, expect } from 'vitest';
import {
  createButton,
  createInput,
  createCard,
  createModal,
  applyAccessibilityPolicy,
  applyTouchTargetPolicy,
  applyReducedMotionPolicy,
  applyFocusPolicy,
  applyLoadingPolicy,
  applyAllFudPolicies,
  validateFudCompliance,
  PolicyViolationError,
  getFocusableElements,
  createFocusTrap,
} from '../src/index.js';

describe('Button Component', () => {
  it('creates button with proper ARIA attributes', () => {
    const button = createButton({
      label: 'Click me',
      ariaLabel: 'Action button',
      variant: 'primary',
    });

    expect(button.aria).toBeDefined();
    expect(button.aria?.role).toBe('button');
    expect(button.aria?.['aria-label']).toBe('Action button');
    expect(button.aria?.['aria-disabled']).toBe(false);
  });

  it('enforces minimum touch target (44x44px)', () => {
    const button = createButton({ label: 'Small Button', size: 'sm' });

    expect(button.touchTarget).toBeDefined();
    expect(button.touchTarget!.minWidth).toBeGreaterThanOrEqual(44);
    expect(button.touchTarget!.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('supports all button sizes with proper touch targets', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      const button = createButton({ label: 'Test', size });
      expect(button.touchTarget!.minWidth).toBeGreaterThanOrEqual(44);
      expect(button.touchTarget!.minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  it('handles loading state with aria-busy', () => {
    const button = createButton({ label: 'Loading...', loading: true });

    expect(button.state?.loading).toBe(true);
    expect(button.aria?.['aria-busy']).toBe(true);
    expect(button.aria?.['aria-disabled']).toBe(true);
  });

  it('supports toggle button state', () => {
    const button = createButton({
      label: 'Toggle',
      isToggle: true,
      ariaPressed: false,
    });

    expect(button.aria?.['aria-pressed']).toBe(false);
    expect(button.state?.isToggle).toBe(true);
  });

  it('alternates pressed state across sequential toggle calls', () => {
    const button = createButton({
      label: 'Toggle',
      isToggle: true,
      ariaPressed: false,
    });

    const firstToggle = button.actions?.toggle?.();
    const secondToggle = button.actions?.toggle?.();
    const thirdToggle = button.actions?.toggle?.();

    expect(firstToggle?.pressed).toBe(true);
    expect(secondToggle?.pressed).toBe(false);
    expect(thirdToggle?.pressed).toBe(true);
    expect(button.state?.pressed).toBe(true);
    expect(button.aria?.['aria-pressed']).toBe(true);
  });

  it('provides click action', () => {
    const button = createButton({ label: 'Click' });
    const result = button.actions?.click?.();

    expect(result).toBeDefined();
    expect(result?.type).toBe('CLICKED');
  });

  it('provides setLoading action', () => {
    const button = createButton({ label: 'Test' });
    const result = button.actions?.setLoading?.(true);

    expect(result?.loading).toBe(true);
  });

  it('prevents clicks when disabled or loading', () => {
    const disabledButton = createButton({ label: 'Disabled', disabled: true });
    const result = disabledButton.actions?.click?.();

    expect(result).toBeUndefined();
  });
});

describe('Input Component', () => {
  it('creates input with proper ARIA attributes', () => {
    const input = createInput({
      label: 'Name',
      ariaLabel: 'Full name input',
      required: true,
    });

    expect(input.aria).toBeDefined();
    expect(input.aria?.role).toBe('textbox');
    expect(input.aria?.['aria-label']).toBe('Full name input');
    expect(input.aria?.['aria-required']).toBe(true);
  });

  it('includes autocomplete attribute support (Autocomplete Attribute Neglect mitigation)', () => {
    const input = createInput({
      label: 'Email',
      autocomplete: 'email',
    });

    expect(input.state?.autocomplete).toBe('email');
  });

  it('defaults to onBlur validation timing (Form Validation Timing mitigation)', () => {
    const input = createInput({ label: 'Username' });

    expect(input.state?.validationTiming).toBe('onBlur');
  });

  it('supports onChange validation timing option', () => {
    const input = createInput({
      label: 'Username',
      validationTiming: 'onChange',
    });

    expect(input.state?.validationTiming).toBe('onChange');
  });

  it('validates on blur and sets touched flag', () => {
    const input = createInput({ label: 'Email', type: 'email', required: true });

    const result = input.actions?.blur?.();

    expect(result?.validation?.touched).toBe(true);
    expect(result?.validation?.errors).toBeDefined();
  });

  it('validates required field', () => {
    const input = createInput({ label: 'Required Field', required: true });

    const changeResult = input.actions?.change?.('');
    const blurResult = input.actions?.blur?.();

    expect(blurResult?.validation?.errors).toContain('This field is required');
  });

  it('validates email format', () => {
    const input = createInput({ label: 'Email', type: 'email' });

    input.actions?.change?.('invalid-email');
    const result = input.actions?.validate?.();

    expect(result?.validation?.errors).toContain('Invalid email address');
  });

  it('provides aria-invalid for invalid state', () => {
    const input = createInput({ label: 'Email', type: 'email' });

    expect(input.aria?.['aria-invalid']).toBe(false);
  });

  it('provides change action', () => {
    const input = createInput({ label: 'Test' });
    const result = input.actions?.change?.('new value');

    expect(result?.type).toBe('VALUE_CHANGED');
    expect(result?.value).toBe('new value');
  });

  it('provides clear action', () => {
    const input = createInput({ label: 'Test' });
    const result = input.actions?.clear?.();

    expect(result?.type).toBe('CLEARED');
    expect(result?.value).toBe('');
  });

  it('provides focus and blur actions', () => {
    const input = createInput({ label: 'Test' });

    const focusResult = input.actions?.focus?.();
    const blurResult = input.actions?.blur?.();

    expect(focusResult?.type).toBe('FOCUSED');
    expect(blurResult?.type).toBe('BLURRED');
  });
});

describe('Card Component', () => {
  it('enforces explicit dimensions for CLS prevention', () => {
    const card = createCard({ width: 300, height: 400 });

    expect(card.state?.width).toBe('300px');
    expect(card.state?.height).toBe('400px');
  });

  it('supports loading skeleton state', () => {
    const card = createCard({ width: 300, height: 400, loading: true });

    expect(card.state?.loading).toBe(true);
    expect(card.state?.showSkeleton).toBe(true);
    expect(card.aria?.['aria-busy']).toBe(true);
  });

  it('includes aria attributes', () => {
    const card = createCard({
      width: 300,
      height: 400,
      ariaLabel: 'Product Card',
    });

    expect(card.aria?.role).toBe('region');
    expect(card.aria?.['aria-label']).toBe('Product Card');
  });

  it('provides startLoading action', () => {
    const card = createCard({ width: 300, height: 400 });
    const result = card.actions?.startLoading?.();

    expect(result?.type).toBe('LOADING_STARTED');
    expect(result?.loading).toBe(true);
    expect(result?.showSkeleton).toBe(true);
  });

  it('provides finishLoading action with content', () => {
    const card = createCard({ width: 300, height: 400 });
    const content = { text: 'Loaded content' };
    const result = card.actions?.finishLoading?.(content);

    expect(result?.type).toBe('LOADING_FINISHED');
    expect(result?.loading).toBe(false);
    expect(result?.showSkeleton).toBe(false);
    expect(result?.content).toEqual(content);
  });

  it('provides setDimensions action', () => {
    const card = createCard({ width: 300, height: 400 });
    const result = card.actions?.setDimensions?.(400, 500);

    expect(result?.type).toBe('DIMENSIONS_SET');
    expect(result?.width).toBe('400px');
    expect(result?.height).toBe('500px');
  });

  it('warns about auto height causing CLS', () => {
    const consoleSpy = { warn: (msg: string) => {} };
    const originalWarn = console.warn;
    let warned = false;

    console.warn = (msg: string) => {
      if (msg.includes('Cumulative Layout Shift')) {
        warned = true;
      }
    };

    createCard({ width: 300, height: 'auto' });

    expect(warned).toBe(true);
    console.warn = originalWarn;
  });
});

describe('Modal Component', () => {
  it('creates modal with focus trap configuration', () => {
    const modal = createModal({ title: 'Confirm Action' });

    expect(modal.focusConfig?.trapFocus).toBe(true);
    expect(modal.focusConfig?.restoreFocus).toBe(true);
  });

  it('includes aria-modal and role="dialog"', () => {
    const modal = createModal({ title: 'Dialog' });

    expect(modal.aria?.role).toBe('dialog');
    expect(modal.aria?.['aria-modal']).toBe(true);
  });

  it('provides open action', () => {
    const modal = createModal({ title: 'Test Modal' });
    const result = modal.actions?.open?.();

    expect(result?.type).toBe('MODAL_OPENED');
    expect(result?.open).toBe(true);
    expect(result?.focusTrapped).toBe(true);
  });

  it('provides close action', () => {
    const modal = createModal({ title: 'Test Modal' });
    modal.actions?.open?.();
    const result = modal.actions?.close?.();

    expect(result?.type).toBe('MODAL_CLOSED');
    expect(result?.open).toBe(false);
    expect(result?.focusTrapped).toBe(false);
  });

  it('provides toggle action', () => {
    const modal = createModal({ title: 'Test Modal' });

    const openResult = modal.actions?.toggle?.();
    expect(openResult?.type).toBe('MODAL_OPENED');

    const closeResult = modal.actions?.toggle?.();
    expect(closeResult?.type).toBe('MODAL_CLOSED');
  });

  it('handles escape key based on config', () => {
    const modalWithEscape = createModal({
      title: 'Test',
      closeOnEscape: true,
    });
    const result = modalWithEscape.actions?.handleEscapeKey?.();

    expect(result?.type).toBe('MODAL_CLOSED');
  });

  it('ignores escape key when closeOnEscape is false', () => {
    const modalWithoutEscape = createModal({
      title: 'Test',
      closeOnEscape: false,
    });
    const result = modalWithoutEscape.actions?.handleEscapeKey?.();

    expect(result?.type).toBe('ESCAPE_KEY_IGNORED');
  });

  it('handles backdrop click based on config', () => {
    const modalWithBackdrop = createModal({
      title: 'Test',
      closeOnBackdropClick: true,
    });
    const result = modalWithBackdrop.actions?.handleBackdropClick?.();

    expect(result?.type).toBe('MODAL_CLOSED');
  });
});

describe('FUD Mitigation Policies', () => {
  it('applyAccessibilityPolicy enforces aria-label on interactive components', () => {
    const component = {
      state: {},
      actions: {},
      aria: { role: 'button' },
    };

    expect(() => {
      applyAccessibilityPolicy(component as any);
    }).toThrow(PolicyViolationError);
  });

  it('applyTouchTargetPolicy enforces 44x44 minimum', () => {
    const component = {
      state: {},
      actions: {},
      touchTarget: { minWidth: 30, minHeight: 30, padding: 0 },
      aria: { role: 'button', 'aria-label': 'Test' },
    };

    expect(() => {
      applyTouchTargetPolicy(component as any);
    }).toThrow(PolicyViolationError);
  });

  it('applyTouchTargetPolicy sets default touch target if missing', () => {
    const component = {
      state: {},
      actions: {},
      aria: { role: 'button', 'aria-label': 'Test' },
    };

    const result = applyTouchTargetPolicy(component as any);

    expect(result.touchTarget?.minWidth).toBe(44);
    expect(result.touchTarget?.minHeight).toBe(44);
  });

  it('applyReducedMotionPolicy sets default config', () => {
    const component = {
      state: {},
      actions: {},
    };

    const result = applyReducedMotionPolicy(component as any);

    expect(result.reducedMotionConfig).toBeDefined();
    expect(result.reducedMotionConfig?.respectPreference).toBe(true);
  });

  it('applyFocusPolicy sets default config', () => {
    const component = {
      state: {},
      actions: {},
    };

    const result = applyFocusPolicy(component as any);

    expect(result.focusConfig).toBeDefined();
    expect(result.focusConfig?.focusVisible).toBe(true);
  });

  it('applyLoadingPolicy enforces explicit dimensions on skeletal components', () => {
    const component = {
      state: { height: 'auto' },
      actions: {},
      loadingState: { skeleton: true, loading: true, interactive: false },
    };

    expect(() => {
      applyLoadingPolicy(component as any);
    }).toThrow(PolicyViolationError);
  });

  it('applyAllFudPolicies applies all policies in sequence', () => {
    const component = {
      state: { width: 300, height: 300 },
      actions: {},
      aria: { role: 'button', 'aria-label': 'Test' },
    };

    const result = applyAllFudPolicies(component as any);

    expect(result.touchTarget).toBeDefined();
    expect(result.focusConfig).toBeDefined();
    expect(result.reducedMotionConfig).toBeDefined();
  });

  it('validateFudCompliance detects touch target violations', () => {
    const component = {
      state: {},
      actions: {},
      touchTarget: { minWidth: 30, minHeight: 30, padding: 0 },
    };

    const result = validateFudCompliance(component as any);

    expect(result.compliant).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('validateFudCompliance detects missing aria labels', () => {
    const component = {
      state: {},
      actions: {},
    };

    const result = validateFudCompliance(component as any);

    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('validateFudCompliance detects CLS risks in loading state', () => {
    const component = {
      state: { height: 'auto' },
      actions: {},
      loadingState: { skeleton: true, loading: true, interactive: false },
    };

    const result = validateFudCompliance(component as any);

    expect(result.compliant).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});

describe('Modal Focus Management', () => {
  it('getFocusableElements returns focusable elements', () => {
    if (typeof document === 'undefined') {
      // Skip test in non-DOM environments
      expect(true).toBe(true);
      return;
    }

    const container = document.createElement('div');
    const button = document.createElement('button');
    const input = document.createElement('input');

    container.appendChild(button);
    container.appendChild(input);

    const focusable = getFocusableElements(container);

    expect(focusable.length).toBeGreaterThanOrEqual(2);
  });

  it('createFocusTrap provides activate and deactivate methods', () => {
    if (typeof document === 'undefined') {
      // Skip test in non-DOM environments
      expect(true).toBe(true);
      return;
    }

    const container = document.createElement('div');
    const trap = createFocusTrap(container);

    expect(trap.activate).toBeDefined();
    expect(trap.deactivate).toBeDefined();
    expect(typeof trap.activate).toBe('function');
    expect(typeof trap.deactivate).toBe('function');
  });
});

describe('Component Integration', () => {
  it('button component passes FUD compliance', () => {
    const button = createButton({ label: 'Test' });
    const compliance = validateFudCompliance(button as any);

    // Allow warnings but require compliance
    expect(compliance.violations.length).toBe(0);
  });

  it('input component passes FUD compliance', () => {
    const input = createInput({ label: 'Test' });
    const compliance = validateFudCompliance(input as any);

    expect(compliance.violations.length).toBe(0);
  });

  it('card component with explicit dimensions passes CLS policy', () => {
    const card = createCard({ width: 300, height: 400, loading: true });
    const compliance = validateFudCompliance(card as any);

    expect(compliance.violations.length).toBe(0);
  });

  it('modal component passes FUD compliance', () => {
    const modal = createModal({ title: 'Test' });
    const compliance = validateFudCompliance(modal as any);

    expect(compliance.violations.length).toBe(0);
  });
});
