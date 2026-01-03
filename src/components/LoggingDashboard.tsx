/**
 * Super Admin Logging Dashboard
 * 
 * SECURITY: Only accessible to users with role='superadmin'
 * 
 * Features:
 * - Real-time audit log viewing
 * - Log filtering and search
 * - Audit statistics
 * - HIPAA compliance reporting
 * - Export audit logs
 */

import React, { useState, useEffect } from 'react';
import { logger, AuditEntry, AuditEventType, LogLevel, AuditStats } from '../services/secureLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import {
    Shield,
    Download,
    Search,
    Filter,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity,
    Users,
    FileText,
} from 'lucide-react';

interface LoggingDashboardProps {
    currentUserRole: string;
    currentUserId: string;
}

export function LoggingDashboard({ currentUserRole, currentUserId }: LoggingDashboardProps) {
    // Security check
    if (currentUserRole !== 'superadmin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-red-500" />
                            <CardTitle>Access Denied</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This dashboard is only accessible to Super Administrators.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const [audits, setAudits] = useState<AuditEntry[]>([]);
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

    useEffect(() => {
        loadData();
        // Refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [dateRange, eventTypeFilter]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Calculate date filter
            const now = new Date();
            let startDate: Date | undefined;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                default:
                    startDate = undefined;
            }

            // Load audits
            const auditData = await logger.getAudits({
                startDate,
                eventType: eventTypeFilter !== 'all' ? eventTypeFilter as AuditEventType : undefined,
                limit: 100,
            });

            setAudits(auditData);

            // Load stats
            const statsData = await logger.getAuditStats();
            setStats(statsData);

            // Audit log: Super admin viewed logs
            logger.audit({
                eventType: AuditEventType.PHI_ACCESS,
                userId: currentUserId,
                resourceType: 'audit_logs',
                action: 'Viewed logging dashboard',
                success: true,
            });
        } catch (error) {
            console.error('Failed to load audit data', error);
        } finally {
            setLoading(false);
        }
    };

    const exportAuditLogs = () => {
        const csv = [
            ['Timestamp', 'Event Type', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Success', 'IP Address'].join(','),
            ...audits.map(audit => [
                audit.timestamp,
                audit.eventType,
                audit.userId,
                audit.action,
                audit.resourceType || '',
                audit.resourceId || '',
                audit.success ? 'Yes' : 'No',
                audit.ipAddress || '',
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        // Audit the export
        logger.audit({
            eventType: AuditEventType.PHI_EXPORT,
            userId: currentUserId,
            resourceType: 'audit_logs',
            action: 'Exported audit logs to CSV',
            success: true,
            metadata: { recordCount: audits.length },
        });
    };

    const filteredAudits = audits.filter(audit => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            audit.userId.toLowerCase().includes(searchLower) ||
            audit.action.toLowerCase().includes(searchLower) ||
            audit.resourceType?.toLowerCase().includes(searchLower) ||
            audit.resourceId?.toLowerCase().includes(searchLower)
        );
    });

    const getEventBadge = (eventType: AuditEventType) => {
        const colors: Record<string, string> = {
            PHI_ACCESS: 'bg-blue-100 text-blue-800',
            PHI_MODIFY: 'bg-yellow-100 text-yellow-800',
            PHI_DELETE: 'bg-red-100 text-red-800',
            PHI_EXPORT: 'bg-purple-100 text-purple-800',
            LOGIN: 'bg-green-100 text-green-800',
            LOGOUT: 'bg-gray-100 text-gray-800',
            FAILED_LOGIN: 'bg-red-100 text-red-800',
        };

        return (
            <Badge className={colors[eventType] || 'bg-gray-100 text-gray-800'}>
                {eventType.replace(/_/g, ' ')}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="h-8 w-8 text-orange-600" />
                        Logging Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        HIPAA-compliant audit trail and system logs
                    </p>
                </div>
                <Button onClick={exportAuditLogs} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Logs
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <span className="text-2xl font-bold">{stats.totalEvents}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Unique Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-600" />
                                <span className="text-2xl font-bold">
                                    {Object.keys(stats.eventsByUser).length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Failed Attempts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <span className="text-2xl font-bold">{stats.failedAttempts}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                PHI Access Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                                <span className="text-2xl font-bold">
                                    {stats.eventsByType['PHI_ACCESS'] || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by user, action, or resource..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Event Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                <SelectItem value="PHI_ACCESS">PHI Access</SelectItem>
                                <SelectItem value="PHI_MODIFY">PHI Modify</SelectItem>
                                <SelectItem value="PHI_DELETE">PHI Delete</SelectItem>
                                <SelectItem value="PHI_EXPORT">PHI Export</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="LOGOUT">Logout</SelectItem>
                                <SelectItem value="FAILED_LOGIN">Failed Login</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Last 7 Days</SelectItem>
                                <SelectItem value="month">Last 30 Days</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Log Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                    <CardDescription>
                        Showing {filteredAudits.length} of {audits.length} events
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Resource</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            Loading audit logs...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAudits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAudits.map((audit, index) => (
                                        <TableRow key={audit.id || index}>
                                            <TableCell className="font-mono text-xs">
                                                {new Date(audit.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getEventBadge(audit.eventType)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {audit.userId.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {audit.action}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div className="font-medium">{audit.resourceType || '-'}</div>
                                                    {audit.resourceId && (
                                                        <div className="text-muted-foreground font-mono">
                                                            {audit.resourceId.substring(0, 12)}...
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {audit.success ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {audit.ipAddress || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* HIPAA Compliance Notice */}
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        HIPAA Compliance
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>
                        This audit trail is maintained in compliance with HIPAA §164.312(b) Audit Controls.
                        All PHI access is logged with timestamp, user identification, and action performed.
                        Logs are immutable and retained for the required period.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
