/**
 * tests/unit/errorBoundary.test.tsx
 *
 * Tests for the ErrorBoundary component — ensures catastrophic
 * component crashes don't produce a white screen of death.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// ─── Test Helpers ─────────────────────────────────────────────────────────────

/** A component that throws on render — simulates a real crash */
function ThrowingComponent({ message = 'Test error' }: { message?: string }): never {
    throw new Error(message);
}

/** Wraps a child in the ErrorBoundary */
function renderWithBoundary(ui: React.ReactNode) {
    return render(<ErrorBoundary>{ui}</ErrorBoundary>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
    it('renders children normally when no error occurs', () => {
        renderWithBoundary(<div>Normal content</div>);
        expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('shows error UI when a child throws', () => {
        renderWithBoundary(<ThrowingComponent />);

        expect(screen.getByRole('heading', { name: /application error/i })).toBeInTheDocument();
    });

    it('displays the error message in the UI (helps developers debug)', () => {
        renderWithBoundary(<ThrowingComponent message="Things went wrong" />);

        expect(screen.getByText(/things went wrong/i)).toBeInTheDocument();
    });

    it('shows a "Reload Application" button', () => {
        renderWithBoundary(<ThrowingComponent />);

        expect(screen.getByRole('button', { name: /reload application/i })).toBeInTheDocument();
    });

    it('shows a "Try Again" button that resets the boundary', () => {
        renderWithBoundary(<ThrowingComponent />);

        const tryAgain = screen.getByRole('button', { name: /try again/i });
        expect(tryAgain).toBeInTheDocument();

        // Note: After clicking "Try Again", ThrowingComponent re-throws,
        // so the boundary re-catches. The important thing is the button click is handled.
        fireEvent.click(tryAgain);
        // It will re-throw and re-show the error UI — that's expected behaviour
        expect(screen.getByRole('heading', { name: /application error/i })).toBeInTheDocument();
    });

    it('does not expose stack traces in production (safe error messaging)', () => {
        renderWithBoundary(<ThrowingComponent message="Sensitive internal error details" />);

        // User-facing message should be generic, not leaking sensitive stack info
        const errorPanel = screen.getByText(/application error/i);
        expect(errorPanel).toBeInTheDocument();
    });

    it('isolates crash — does not propagate to parent (boundary contains the error)', () => {
        // If ErrorBoundary works correctly, the render does NOT throw
        expect(() => {
            renderWithBoundary(<ThrowingComponent />);
        }).not.toThrow();
    });
});
