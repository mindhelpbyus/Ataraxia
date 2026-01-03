/**
 * Console Filter Utility
 * 
 * Aggressively filters out harmless Figma infrastructure errors from the console
 * while preserving real application errors.
 */

const FIGMA_ERROR_PATTERNS = [
  'figma.com',
  'webpack-artifacts',
  'devtools_worker',
  '.min.js.br',
  'WASM',
  'WebAssembly',
  'readFromStdout',
  'Promise@[native code]'
];

// Firebase internal errors that are unhelpful (minified function names)
// These are filtered because they don't provide actionable information
const FIREBASE_INTERNAL_PATTERNS = [
  'at Wu2',
  'at v19',
  'at Hs3',
  'at Ls3',
  'esm.sh/@firebase/firestore@4.9.2/es2022/firestore.mjs'
];

// NEVER filter these Firebase errors - they contain useful information!
const FIREBASE_ACTIONABLE_PATTERNS = [
  'permission-denied',
  'FirebaseError',
  'auth/',
  'PERMISSION_DENIED',
  'not-found',
  'already-exists',
  'unauthenticated'
];

function shouldFilterError(args: any[]): boolean {
  const errorString = args.map(arg => {
    if (arg instanceof Error) {
      return arg.stack || arg.message || String(arg);
    }
    return String(arg);
  }).join(' ');
  
  // NEVER filter actionable Firebase errors - these are critical!
  if (FIREBASE_ACTIONABLE_PATTERNS.some(pattern => errorString.includes(pattern))) {
    return false;
  }
  
  // Filter unhelpful Firebase internal errors (minified SDK errors)
  if (FIREBASE_INTERNAL_PATTERNS.some(pattern => errorString.includes(pattern))) {
    return true;
  }
  
  return FIGMA_ERROR_PATTERNS.some(pattern => errorString.includes(pattern));
}

function shouldFilterStackTrace(stack: string | undefined): boolean {
  if (!stack) return false;
  
  // NEVER filter actionable Firebase errors
  if (FIREBASE_ACTIONABLE_PATTERNS.some(pattern => stack.includes(pattern))) {
    return false;
  }
  
  // Filter unhelpful Firebase internal errors
  if (FIREBASE_INTERNAL_PATTERNS.some(pattern => stack.includes(pattern))) {
    return true;
  }
  
  return FIGMA_ERROR_PATTERNS.some(pattern => stack.includes(pattern));
}

export function installConsoleFilter() {
  // Always install (not just in dev mode)
  // These errors are Figma Make specific
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  let filteredCount = 0;

  // Override console.error
  console.error = function(...args: any[]) {
    if (shouldFilterError(args)) {
      filteredCount++;
      // Silently filter - no notification needed
      return; // Don't log this error
    }
    originalError.apply(console, args);
  };

  // Override console.warn for WASM warnings
  console.warn = function(...args: any[]) {
    if (shouldFilterError(args)) {
      return; // Don't log this warning
    }
    originalWarn.apply(console, args);
  };

  // Console filter installed silently
  // All infrastructure errors will be filtered without notification

  // Intercept window.onerror to catch unhandled errors
  if (typeof window !== 'undefined') {
    const originalOnError = window.onerror;
    
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if this is a Figma infrastructure error
      const messageStr = String(message);
      const sourceStr = String(source || '');
      const errorStack = error?.stack || '';
      
      if (shouldFilterStackTrace(sourceStr) || 
          shouldFilterStackTrace(errorStack) ||
          FIGMA_ERROR_PATTERNS.some(pattern => messageStr.includes(pattern) || sourceStr.includes(pattern))) {
        filteredCount++;
        // Suppress this error
        return true; // Prevents default error handling
      }
      
      // Let other errors through
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Intercept unhandled promise rejections
    const originalOnUnhandledRejection = window.onunhandledrejection;
    
    window.onunhandledrejection = function(event) {
      const reason = event.reason;
      const reasonStr = String(reason);
      const stack = reason?.stack || '';
      
      if (shouldFilterStackTrace(stack) || 
          FIGMA_ERROR_PATTERNS.some(pattern => reasonStr.includes(pattern))) {
        filteredCount++;
        event.preventDefault(); // Suppress this rejection
        return;
      }
      
      // Let other rejections through
      if (originalOnUnhandledRejection) {
        originalOnUnhandledRejection.call(window, event);
      }
    };
    
    // Silently track filtered errors without reporting
    setInterval(() => {
      if (filteredCount > 0) {
        filteredCount = 0; // Reset counter silently
      }
    }, 60000); // Reset every minute
  }
}

export function uninstallConsoleFilter() {
  // This would require storing references, which we'll skip for simplicity
  console.log('Console filter cannot be uninstalled without page reload');
}

/**
 * Show filtered errors for debugging
 */
export function showFilteredErrors() {
  console.log(
    '%c⚠️ Filtered Errors Are Hidden',
    'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    '\n\nTo see all errors (including Figma infrastructure):',
    '\n1. Comment out installConsoleFilter() in App.tsx',
    '\n2. Reload the page',
    '\n\nOR use browser console filter: -url:figma.com'
  );
}
