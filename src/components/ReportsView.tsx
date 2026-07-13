import { useState } from 'react';
import { UserRole } from '../types/appointment';
import { TherapistReports } from './reports/TherapistReports';
import { AdminReports } from './reports/AdminReports';
import { SuperAdminReports } from './reports/SuperAdminReports';
import { Button } from './ui/button';
import { FileSpreadsheet, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { type ExportableReport, downloadCsv } from './reports/reportUtils';
import { toast } from 'sonner';

interface ReportsViewProps {
  userRole: UserRole;
  currentUserId: string;
  userEmail: string;
}

export function ReportsView({ userRole, currentUserId, userEmail }: ReportsViewProps) {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
  const [exportData, setExportData] = useState<ExportableReport | null>(null);

  const handleExportCsv = () => {
    if (!exportData) {
      toast.info('Nothing to export yet — no data in the selected period.');
      return;
    }
    downloadCsv(exportData, dateRange);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink mb-2">
                {userRole === 'superadmin' ? 'Platform Analytics' : userRole === 'admin' ? 'Practice Reports' : 'Performance Metrics'}
              </h1>
              <p className="text-muted-text">
                {userRole === 'superadmin'
                  ? 'System-wide metrics and platform performance'
                  : userRole === 'admin'
                    ? 'Comprehensive practice insights and analytics'
                    : 'Your clinical performance and workload summary'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-[180px] bg-card border-rule shadow-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-text" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-card border-rule shadow-sm hover:bg-surface-warm text-body-text"
                onClick={handleExportCsv}
                disabled={!exportData}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Role-based Reports */}
        {userRole === 'therapist' && (
          <TherapistReports
            currentUserId={currentUserId}
            userEmail={userEmail}
            dateRange={dateRange}
            onExportReady={setExportData}
          />
        )}

        {userRole === 'admin' && (
          <AdminReports
            dateRange={dateRange}
            onExportReady={setExportData}
          />
        )}

        {userRole === 'superadmin' && (
          <SuperAdminReports
            dateRange={dateRange}
            onExportReady={setExportData}
          />
        )}
      </div>
    </div>
  );
}
