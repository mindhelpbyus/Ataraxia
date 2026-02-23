/**
 * components/index.ts — Master barrel export
 *
 * Single entry point for all component imports.
 * Organized by Atomic Design tier (Chief Architect Prescribed).
 *
 * Usage:
 *   import { Button, DashboardLayout, LoginPage } from '@/components';
 *
 * Or tier-specific:
 *   import { Button } from '@/components/atoms';
 *   import { AppointmentPanel } from '@/components/organisms';
 *   import { DashboardLayout } from '@/components/templates';
 */

export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';
export * from './pages';
