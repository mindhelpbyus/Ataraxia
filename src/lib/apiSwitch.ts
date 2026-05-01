/**
 * lib/apiSwitch.ts — Environment-based API / LocalDB switch
 *
 * Set VITE_USE_LOCAL_DB=true in .env.local to use localStorage.
 * Remove or set to false for real backend calls. Zero code changes needed.
 */
export const USE_LOCAL_DB =
  import.meta.env.VITE_USE_LOCAL_DB === 'true' ||
  import.meta.env.MODE === 'demo';
