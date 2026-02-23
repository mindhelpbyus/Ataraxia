/**
 * logStorageBackends.ts
 *
 * ✅ ARCHITECTURE NOTE:
 * Log and audit storage backends (Firestore, PostgreSQL, MongoDB) belong
 * exclusively on the Gravity Reunion backend (Cloud Run + PostgreSQL).
 *
 * The frontend NEVER writes logs directly to a database.
 * All client-side log entries are forwarded to:
 *   POST /api/v1/logs        (application logs)
 *   POST /api/v1/audit       (HIPAA audit events)
 *
 * The secureLogger service handles batching and forwarding.
 * This file is kept as an empty module to avoid breaking existing imports.
 */

export { };
