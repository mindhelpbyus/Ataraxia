/**
 * Storage Backend Implementations for Secure Logger
 * 
 * Choose the backend that matches your database:
 * - Firestore (Google Cloud)
 * - PostgreSQL
 * - MongoDB
 * - MySQL
 */

import {
    LogStorageBackend,
    LogEntry,
    AuditEntry,
    LogFilters,
    AuditFilters,
    AuditStats,
} from './secureLogger';

/**
 * Firestore Storage Backend
 * Use this if you're using Google Cloud Firestore
 */
export class FirestoreLogStorage implements LogStorageBackend {
    private db: any; // Firestore instance

    constructor(firestoreInstance: any) {
        this.db = firestoreInstance;
    }

    async saveLog(entry: LogEntry): Promise<void> {
        await this.db.collection('logs').add(entry);
    }

    async saveAudit(entry: AuditEntry): Promise<void> {
        // Audit logs are append-only (immutable)
        await this.db.collection('audit_logs').add(entry);
    }

    async getLogs(filters?: LogFilters): Promise<LogEntry[]> {
        let query = this.db.collection('logs').orderBy('timestamp', 'desc');

        if (filters?.startDate) {
            query = query.where('timestamp', '>=', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            query = query.where('timestamp', '<=', filters.endDate.toISOString());
        }
        if (filters?.level !== undefined) {
            query = query.where('level', '==', filters.level);
        }
        if (filters?.userId) {
            query = query.where('userId', '==', filters.userId);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }

    async getAudits(filters?: AuditFilters): Promise<AuditEntry[]> {
        let query = this.db.collection('audit_logs').orderBy('timestamp', 'desc');

        if (filters?.startDate) {
            query = query.where('timestamp', '>=', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            query = query.where('timestamp', '<=', filters.endDate.toISOString());
        }
        if (filters?.userId) {
            query = query.where('userId', '==', filters.userId);
        }
        if (filters?.eventType) {
            query = query.where('eventType', '==', filters.eventType);
        }
        if (filters?.resourceType) {
            query = query.where('resourceType', '==', filters.resourceType);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }

    async getAuditStats(): Promise<AuditStats> {
        const snapshot = await this.db.collection('audit_logs').get();
        const audits = snapshot.docs.map((doc: any) => doc.data());

        const eventsByType: Record<string, number> = {};
        const eventsByUser: Record<string, number> = {};
        let failedAttempts = 0;

        audits.forEach((audit: AuditEntry) => {
            eventsByType[audit.eventType] = (eventsByType[audit.eventType] || 0) + 1;
            eventsByUser[audit.userId] = (eventsByUser[audit.userId] || 0) + 1;
            if (!audit.success) failedAttempts++;
        });

        const recentSnapshot = await this.db
            .collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        return {
            totalEvents: audits.length,
            eventsByType,
            eventsByUser,
            recentEvents: recentSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
            failedAttempts,
        };
    }
}

/**
 * PostgreSQL Storage Backend
 * Use this if you're using PostgreSQL
 */
export class PostgreSQLLogStorage implements LogStorageBackend {
    private pool: any; // pg.Pool instance

    constructor(pgPool: any) {
        this.pool = pgPool;
    }

    async saveLog(entry: LogEntry): Promise<void> {
        await this.pool.query(
            `INSERT INTO logs (timestamp, level, message, context, user_id, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                entry.timestamp,
                entry.level,
                entry.message,
                JSON.stringify(entry.context),
                entry.userId,
                entry.sessionId,
            ]
        );
    }

    async saveAudit(entry: AuditEntry): Promise<void> {
        await this.pool.query(
            `INSERT INTO audit_logs (
        timestamp, event_type, user_id, resource_id, resource_type,
        action, ip_address, user_agent, success, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                entry.timestamp,
                entry.eventType,
                entry.userId,
                entry.resourceId,
                entry.resourceType,
                entry.action,
                entry.ipAddress,
                entry.userAgent,
                entry.success,
                JSON.stringify(entry.metadata),
            ]
        );
    }

    async getLogs(filters?: LogFilters): Promise<LogEntry[]> {
        let query = 'SELECT * FROM logs WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (filters?.startDate) {
            query += ` AND timestamp >= $${paramIndex++}`;
            params.push(filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            query += ` AND timestamp <= $${paramIndex++}`;
            params.push(filters.endDate.toISOString());
        }
        if (filters?.level !== undefined) {
            query += ` AND level = $${paramIndex++}`;
            params.push(filters.level);
        }
        if (filters?.userId) {
            query += ` AND user_id = $${paramIndex++}`;
            params.push(filters.userId);
        }

        query += ' ORDER BY timestamp DESC';

        if (filters?.limit) {
            query += ` LIMIT $${paramIndex++}`;
            params.push(filters.limit);
        }

        const result = await this.pool.query(query, params);
        return result.rows.map((row: any) => ({
            ...row,
            context: row.context ? JSON.parse(row.context) : undefined,
        }));
    }

    async getAudits(filters?: AuditFilters): Promise<AuditEntry[]> {
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (filters?.startDate) {
            query += ` AND timestamp >= $${paramIndex++}`;
            params.push(filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            query += ` AND timestamp <= $${paramIndex++}`;
            params.push(filters.endDate.toISOString());
        }
        if (filters?.userId) {
            query += ` AND user_id = $${paramIndex++}`;
            params.push(filters.userId);
        }
        if (filters?.eventType) {
            query += ` AND event_type = $${paramIndex++}`;
            params.push(filters.eventType);
        }
        if (filters?.resourceType) {
            query += ` AND resource_type = $${paramIndex++}`;
            params.push(filters.resourceType);
        }

        query += ' ORDER BY timestamp DESC';

        if (filters?.limit) {
            query += ` LIMIT $${paramIndex++}`;
            params.push(filters.limit);
        }

        const result = await this.pool.query(query, params);
        return result.rows.map((row: any) => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        }));
    }

    async getAuditStats(): Promise<AuditStats> {
        const statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE success = false) as failed_attempts,
        json_object_agg(event_type, event_count) as events_by_type,
        json_object_agg(user_id, user_count) as events_by_user
      FROM (
        SELECT 
          event_type,
          user_id,
          success,
          COUNT(*) OVER (PARTITION BY event_type) as event_count,
          COUNT(*) OVER (PARTITION BY user_id) as user_count
        FROM audit_logs
      ) subquery
    `;

        const recentQuery = `
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 10
    `;

        const [statsResult, recentResult] = await Promise.all([
            this.pool.query(statsQuery),
            this.pool.query(recentQuery),
        ]);

        const stats = statsResult.rows[0];

        return {
            totalEvents: parseInt(stats.total_events),
            eventsByType: stats.events_by_type || {},
            eventsByUser: stats.events_by_user || {},
            recentEvents: recentResult.rows,
            failedAttempts: parseInt(stats.failed_attempts),
        };
    }
}

/**
 * MongoDB Storage Backend
 * Use this if you're using MongoDB
 */
export class MongoDBLogStorage implements LogStorageBackend {
    private db: any; // MongoDB database instance

    constructor(mongoDb: any) {
        this.db = mongoDb;
    }

    async saveLog(entry: LogEntry): Promise<void> {
        await this.db.collection('logs').insertOne(entry);
    }

    async saveAudit(entry: AuditEntry): Promise<void> {
        await this.db.collection('audit_logs').insertOne(entry);
    }

    async getLogs(filters?: LogFilters): Promise<LogEntry[]> {
        const query: any = {};

        if (filters?.startDate || filters?.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = filters.startDate.toISOString();
            }
            if (filters.endDate) {
                query.timestamp.$lte = filters.endDate.toISOString();
            }
        }
        if (filters?.level !== undefined) {
            query.level = filters.level;
        }
        if (filters?.userId) {
            query.userId = filters.userId;
        }

        let cursor = this.db
            .collection('logs')
            .find(query)
            .sort({ timestamp: -1 });

        if (filters?.limit) {
            cursor = cursor.limit(filters.limit);
        }

        return await cursor.toArray();
    }

    async getAudits(filters?: AuditFilters): Promise<AuditEntry[]> {
        const query: any = {};

        if (filters?.startDate || filters?.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = filters.startDate.toISOString();
            }
            if (filters.endDate) {
                query.timestamp.$lte = filters.endDate.toISOString();
            }
        }
        if (filters?.userId) {
            query.userId = filters.userId;
        }
        if (filters?.eventType) {
            query.eventType = filters.eventType;
        }
        if (filters?.resourceType) {
            query.resourceType = filters.resourceType;
        }

        let cursor = this.db
            .collection('audit_logs')
            .find(query)
            .sort({ timestamp: -1 });

        if (filters?.limit) {
            cursor = cursor.limit(filters.limit);
        }

        return await cursor.toArray();
    }

    async getAuditStats(): Promise<AuditStats> {
        const [totalEvents, eventsByType, eventsByUser, recentEvents, failedAttempts] =
            await Promise.all([
                this.db.collection('audit_logs').countDocuments(),
                this.db.collection('audit_logs').aggregate([
                    { $group: { _id: '$eventType', count: { $sum: 1 } } },
                ]).toArray(),
                this.db.collection('audit_logs').aggregate([
                    { $group: { _id: '$userId', count: { $sum: 1 } } },
                ]).toArray(),
                this.db
                    .collection('audit_logs')
                    .find()
                    .sort({ timestamp: -1 })
                    .limit(10)
                    .toArray(),
                this.db.collection('audit_logs').countDocuments({ success: false }),
            ]);

        const eventsByTypeMap: Record<string, number> = {};
        eventsByType.forEach((item: any) => {
            eventsByTypeMap[item._id] = item.count;
        });

        const eventsByUserMap: Record<string, number> = {};
        eventsByUser.forEach((item: any) => {
            eventsByUserMap[item._id] = item.count;
        });

        return {
            totalEvents,
            eventsByType: eventsByTypeMap,
            eventsByUser: eventsByUserMap,
            recentEvents,
            failedAttempts,
        };
    }
}

/**
 * Usage Examples:
 * 
 * // Firestore
 * import { initializeApp } from 'firebase/app';
 * import { getFirestore } from 'firebase/firestore';
 * import { logger } from './services/secureLogger';
 * import { FirestoreLogStorage } from './services/logStorageBackends';
 * 
 * const app = initializeApp(firebaseConfig);
 * const db = getFirestore(app);
 * logger.setStorage(new FirestoreLogStorage(db));
 * 
 * // PostgreSQL
 * import { Pool } from 'pg';
 * import { logger } from './services/secureLogger';
 * import { PostgreSQLLogStorage } from './services/logStorageBackends';
 * 
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * logger.setStorage(new PostgreSQLLogStorage(pool));
 * 
 * // MongoDB
 * import { MongoClient } from 'mongodb';
 * import { logger } from './services/secureLogger';
 * import { MongoDBLogStorage } from './services/logStorageBackends';
 * 
 * const client = new MongoClient(process.env.MONGODB_URI);
 * await client.connect();
 * const db = client.db('ataraxia');
 * logger.setStorage(new MongoDBLogStorage(db));
 */
