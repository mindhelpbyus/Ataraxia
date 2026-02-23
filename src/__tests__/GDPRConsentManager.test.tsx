import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GDPRConsentManager } from '../components/GDPRConsentManager';

/**
 * ✅ P2 FIX: GDPR consent manager tests
 */
describe('GDPRConsentManager Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows banner when no consent is stored', () => {
    render(<GDPRConsentManager />);
    expect(screen.getByText('We value your privacy')).toBeInTheDocument();
  });

  it('does not show banner when consent is already stored', () => {
    localStorage.setItem('gdpr-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }));

    render(<GDPRConsentManager />);
    expect(screen.queryByText('We value your privacy')).not.toBeInTheDocument();
  });

  it('saves consent when Accept All is clicked', () => {
    const onConsentChange = vi.fn();
    render(<GDPRConsentManager onConsentChange={onConsentChange} />);
    
    fireEvent.click(screen.getByText('Accept All'));
    
    expect(onConsentChange).toHaveBeenCalledWith({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
    
    const stored = localStorage.getItem('gdpr-consent');
    expect(stored).toBeTruthy();
  });

  it('saves only necessary cookies when Necessary Only is clicked', () => {
    const onConsentChange = vi.fn();
    render(<GDPRConsentManager onConsentChange={onConsentChange} />);
    
    fireEvent.click(screen.getByText('Necessary Only'));
    
    expect(onConsentChange).toHaveBeenCalledWith({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  });

  it('opens detailed preferences dialog when Customize is clicked', () => {
    render(<GDPRConsentManager />);
    
    fireEvent.click(screen.getByText('Customize'));
    
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
  });
});
