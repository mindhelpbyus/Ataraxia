/**
 * AWS CloudWatch + S3 Storage Backend
 * 
 * Features:
 * - Real-time logging to CloudWatch Logs
 * - Automatic S3 archival after 30 days
 * - HIPAA-compliant log retention
 * - Cost-effective long-term storage
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
 * AWS CloudWatch + S3 Storage Backend
 * 
 * Setup:
 * 1. Create CloudWatch Log Groups:
 *    - /ataraxia/app-logs
 *    - /ataraxia/audit-logs
 * 
 * 2. Create S3 Bucket:
 *    - ataraxia-logs-archive
 * 
 * 3. Set up CloudWatch Log Export to S3:
 *    - Automatic export after 30 days
 *    - Lifecycle policy: Archive to Glacier after 90 days
 * 
 * 4. IAM Permissions:
 *    - logs:PutLogEvents
 *    - logs:CreateLogStream
 *    - logs:DescribeLogStreams
 *    - s3:PutObject (for manual exports)
 */
export class AWSCloudWatchStorage implements LogStorageBackend {
    private cloudwatchlogs: any; // AWS.CloudWatchLogs instance
    private s3: any; // AWS.S3 instance
    private logGroupName: string;
    private auditLogGroupName: string;
    private s3Bucket: string;

    constructor(config: {
        cloudwatchlogs: any;
        s3: any;
        logGroupName?: string;
        auditLogGroupName?: string;
        s3Bucket?: string;
    }) {
        this.cloudwatchlogs = config.cloudwatchlogs;
        this.s3 = config.s3;
        this.logGroupName = config.logGroupName || '/ataraxia/app-logs';
        this.auditLogGroupName = config.auditLogGroupName || '/ataraxia/audit-logs';
        this.s3Bucket = config.s3Bucket || 'ataraxia-logs-archive';
    }

    /**
     * Save log to CloudWatch
     */
    async saveLog(entry: LogEntry): Promise<void> {
        const logStreamName = this.getLogStreamName('app');

        await this.ensureLogStream(this.logGroupName, logStreamName);

        await this.cloudwatchlogs.putLogEvents({
            logGroupName: this.logGroupName,
            logStreamName,
            logEvents: [{
                message: JSON.stringify(entry),
                timestamp: new Date(entry.timestamp).getTime(),
            }],
        }).promise();
    }

    /**
     * Save audit log to CloudWatch
     * Audit logs are automatically exported to S3 after 30 days
     */
    async saveAudit(entry: AuditEntry): Promise<void> {
        const logStreamName = this.getLogStreamName('audit');

        await this.ensureLogStream(this.auditLogGroupName, logStreamName);

        await this.cloudwatchlogs.putLogEvents({
            logGroupName: this.auditLogGroupName,
            logStreamName,
            logEvents: [{
                message: JSON.stringify(entry),
                timestamp: new Date(entry.timestamp).getTime(),
            }],
        }).promise();
    }

    /**
     * Get logs from CloudWatch (recent) or S3 (archived)
     */
    async getLogs(filters?: LogFilters): Promise<LogEntry[]> {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

        // If requesting data older than 30 days, fetch from S3
        if (filters?.startDate && filters.startDate.getTime() < thirtyDaysAgo) {
            return this.getLogsFromS3(filters);
        }

        // Otherwise, fetch from CloudWatch
        return this.getLogsFromCloudWatch(filters);
    }

    /**
     * Get recent logs from CloudWatch
     */
    private async getLogsFromCloudWatch(filters?: LogFilters): Promise<LogEntry[]> {
        const params: any = {
            logGroupName: this.logGroupName,
            startTime: filters?.startDate?.getTime(),
            endTime: filters?.endDate?.getTime(),
            limit: filters?.limit || 100,
        };

        const response = await this.cloudwatchlogs.filterLogEvents(params).promise();

        return response.events.map((event: any) => {
            try {
                return JSON.parse(event.message);
            } catch {
                return {
                    timestamp: new Date(event.timestamp).toISOString(),
                    level: 1,
                    message: event.message,
                };
            }
        });
    }

    /**
     * Get archived logs from S3
     */
    private async getLogsFromS3(filters?: LogFilters): Promise<LogEntry[]> {
        const logs: LogEntry[] = [];

        // List objects in S3 bucket for the date range
        const startDate = filters?.startDate || new Date(0);
        const endDate = filters?.endDate || new Date();

        const params = {
            Bucket: this.s3Bucket,
            Prefix: 'app-logs/',
        };

        const response = await this.s3.listObjectsV2(params).promise();

        // Download and parse relevant log files
        for (const obj of response.Contents || []) {
            const key = obj.Key;

            // Extract date from key (format: app-logs/2024/11/30/...)
            const dateMatch = key.match(/(\d{4})\/(\d{2})\/(\d{2})/);
            if (!dateMatch) continue;

            const fileDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);

            if (fileDate >= startDate && fileDate <= endDate) {
                const data = await this.s3.getObject({
                    Bucket: this.s3Bucket,
                    Key: key,
                }).promise();

                const content = data.Body.toString('utf-8');
                const lines = content.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const entry = JSON.parse(line);
                        logs.push(entry);
                    } catch {
                        // Skip invalid lines
                    }
                }
            }
        }

        // Apply filters
        let filtered = logs;

        if (filters?.level !== undefined) {
            filtered = filtered.filter(log => log.level === filters.level);
        }
        if (filters?.userId) {
            filtered = filtered.filter(log => log.userId === filters.userId);
        }
        if (filters?.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    /**
     * Get audit logs (CloudWatch + S3)
     */
    async getAudits(filters?: AuditFilters): Promise<AuditEntry[]> {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

        if (filters?.startDate && filters.startDate.getTime() < thirtyDaysAgo) {
            return this.getAuditsFromS3(filters);
        }

        return this.getAuditsFromCloudWatch(filters);
    }

    private async getAuditsFromCloudWatch(filters?: AuditFilters): Promise<AuditEntry[]> {
        const params: any = {
            logGroupName: this.auditLogGroupName,
            startTime: filters?.startDate?.getTime(),
            endTime: filters?.endDate?.getTime(),
            limit: filters?.limit || 100,
        };

        if (filters?.eventType) {
            params.filterPattern = `{ $.eventType = "${filters.eventType}" }`;
        }

        const response = await this.cloudwatchlogs.filterLogEvents(params).promise();

        const audits = response.events.map((event: any) => {
            try {
                return JSON.parse(event.message);
            } catch {
                return null;
            }
        }).filter(Boolean);

        // Apply additional filters
        let filtered = audits;

        if (filters?.userId) {
            filtered = filtered.filter((a: AuditEntry) => a.userId === filters.userId);
        }
        if (filters?.resourceType) {
            filtered = filtered.filter((a: AuditEntry) => a.resourceType === filters.resourceType);
        }

        return filtered;
    }

    private async getAuditsFromS3(filters?: AuditFilters): Promise<AuditEntry[]> {
        const audits: AuditEntry[] = [];

        const startDate = filters?.startDate || new Date(0);
        const endDate = filters?.endDate || new Date();

        const params = {
            Bucket: this.s3Bucket,
            Prefix: 'audit-logs/',
        };

        const response = await this.s3.listObjectsV2(params).promise();

        for (const obj of response.Contents || []) {
            const key = obj.Key;
            const dateMatch = key.match(/(\d{4})\/(\d{2})\/(\d{2})/);
            if (!dateMatch) continue;

            const fileDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);

            if (fileDate >= startDate && fileDate <= endDate) {
                const data = await this.s3.getObject({
                    Bucket: this.s3Bucket,
                    Key: key,
                }).promise();

                const content = data.Body.toString('utf-8');
                const lines = content.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const entry = JSON.parse(line);
                        audits.push(entry);
                    } catch {
                        // Skip invalid lines
                    }
                }
            }
        }

        // Apply filters
        let filtered = audits;

        if (filters?.userId) {
            filtered = filtered.filter(a => a.userId === filters.userId);
        }
        if (filters?.eventType) {
            filtered = filtered.filter(a => a.eventType === filters.eventType);
        }
        if (filters?.resourceType) {
            filtered = filtered.filter(a => a.resourceType === filters.resourceType);
        }
        if (filters?.limit) {
            filtered = filtered.slice(0, filters.limit);
        }

        return filtered;
    }

    /**
     * Get audit statistics
     */
    async getAuditStats(): Promise<AuditStats> {
        // Get recent audits from CloudWatch
        const recentAudits = await this.getAuditsFromCloudWatch({ limit: 1000 });

        const eventsByType: Record<string, number> = {};
        const eventsByUser: Record<string, number> = {};
        let failedAttempts = 0;

        recentAudits.forEach(audit => {
            eventsByType[audit.eventType] = (eventsByType[audit.eventType] || 0) + 1;
            eventsByUser[audit.userId] = (eventsByUser[audit.userId] || 0) + 1;
            if (!audit.success) failedAttempts++;
        });

        return {
            totalEvents: recentAudits.length,
            eventsByType,
            eventsByUser,
            recentEvents: recentAudits.slice(0, 10),
            failedAttempts,
        };
    }

    /**
     * Ensure log stream exists
     */
    private async ensureLogStream(logGroupName: string, logStreamName: string): Promise<void> {
        try {
            await this.cloudwatchlogs.createLogStream({
                logGroupName,
                logStreamName,
            }).promise();
        } catch (error: any) {
            // Stream already exists, ignore
            if (error.code !== 'ResourceAlreadyExistsException') {
                throw error;
            }
        }
    }

    /**
     * Get log stream name (daily rotation)
     */
    private getLogStreamName(type: 'app' | 'audit'): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${type}-${year}-${month}-${day}`;
    }
}

/**
 * Usage Example:
 * 
 * import AWS from 'aws-sdk';
 * import { logger } from './services/secureLogger';
 * import { AWSCloudWatchStorage } from './services/logStorageBackends';
 * 
 * // Configure AWS
 * AWS.config.update({
 *   region: 'us-east-1',
 *   credentials: {
 *     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 *     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 *   },
 * });
 * 
 * const cloudwatchlogs = new AWS.CloudWatchLogs();
 * const s3 = new AWS.S3();
 * 
 * // Set up storage backend
 * logger.setStorage(new AWSCloudWatchStorage({
 *   cloudwatchlogs,
 *   s3,
 *   logGroupName: '/ataraxia/app-logs',
 *   auditLogGroupName: '/ataraxia/audit-logs',
 *   s3Bucket: 'ataraxia-logs-archive',
 * }));
 * 
 * // CloudWatch Log Group Retention Settings:
 * // - Set retention to 30 days
 * // - Enable automatic export to S3
 * // - S3 lifecycle policy:
 * //   - Transition to Glacier after 90 days
 * //   - Delete after 7 years (HIPAA requirement)
 */
