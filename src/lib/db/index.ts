/**
 * lib/db/index.ts — Public entry point for local DB
 *
 * Re-exports everything needed from the local database module.
 */
export { localDb, localAuth, resetLocalDb } from './localDb';
export type * from './schema';
