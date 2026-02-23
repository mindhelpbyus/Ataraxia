/**
 * components/molecules/index.ts
 *
 * MOLECULES: Simple combinations of atoms that form reusable UI units.
 * May have minimal local state (e.g., open/closed toggle) but no API calls.
 *
 * Chief Architect Atomic Design §4 (FRONTEND_ARCHITECTURE.md)
 */

// ─── Forms ────────────────────────────────────────────────────────────────────
export { default as AddressAutocomplete } from '../AddressAutocomplete';
export { PhoneInput } from '../PhoneInput';
export { SignatureCapture } from '../SignatureCapture';

// ─── Cards & Display ──────────────────────────────────────────────────────────
export { EnhancedAppointmentCard } from '../EnhancedAppointmentCard';
export { MiniCalendar } from '../MiniCalendar';
export { ProfileCompletionBanner } from '../ProfileCompletionBanner';
export { VerificationBanner } from '../VerificationBanner';
export { BedrockWatermark } from '../BedrockWatermark';
export { SessionTimeoutWarning } from '../SessionTimeoutWarning';

// ─── Navigation ───────────────────────────────────────────────────────────────
export { GlobalSearchBar } from '../GlobalSearchBar';
export { AppLoadingFallback } from '../AppLoadingFallback';
