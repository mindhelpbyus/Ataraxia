import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GdprConsent } from '../components/GdprConsent';

describe('GdprConsent Component', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Clear all Mocks
        vi.clearAllMocks();
    });

    it('renders the banner when no consent is stored in localStorage', () => {
        render(<GdprConsent />);
        expect(screen.getByTestId('gdpr-consent-banner')).toBeTruthy();
        expect(screen.getByText(/We value your privacy/i)).toBeTruthy();
    });

    it('does not render the banner if consent was already given', () => {
        localStorage.setItem('ataraxia_gdpr_consent', 'accepted');
        const { container } = render(<GdprConsent />);
        expect(screen.queryByTestId('gdpr-consent-banner')).toBeNull();
    });

    it('hides the banner and saves to localStorage when Accept is clicked', () => {
        render(<GdprConsent />);
        const acceptBtn = screen.getByTestId('gdpr-accept-button');
        fireEvent.click(acceptBtn);

        // Check if it was saved to localStorage
        expect(localStorage.getItem('ataraxia_gdpr_consent')).toBe('accepted');
    });

    it('hides the banner and saves to localStorage when Decline is clicked', () => {
        render(<GdprConsent />);
        const declineBtn = screen.getByTestId('gdpr-decline-button');
        fireEvent.click(declineBtn);

        // Check if it was saved to localStorage
        expect(localStorage.getItem('ataraxia_gdpr_consent')).toBe('declined');
    });
});
