import React, { useState } from 'react';
import { UserRole } from '../types/appointment';
import { TherapistReports } from './reports/TherapistReports';
import { AdminReports } from './reports/AdminReports';
import { SuperAdminReports } from './reports/SuperAdminReports';
import { Button } from './ui/button';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ReportsViewProps {
  userRole: UserRole;
  currentUserId: string;
  userEmail: string;
}

export function ReportsView({ userRole, currentUserId, userEmail }: ReportsViewProps) {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | '1year'>('30days');

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                {userRole === 'superadmin' ? 'Platform Analytics' : userRole === 'admin' ? 'Practice Reports' : 'Performance Metrics'}
              </h1>
              <p className="text-slate-500">
                {userRole === 'superadmin'
                  ? 'System-wide metrics and platform performance'
                  : userRole === 'admin'
                    ? 'Comprehensive practice insights and analytics'
                    : 'Your clinical performance and workload summary'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="w-[180px] bg-white border-slate-200 shadow-sm">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500" />
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
                className="bg-white border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700"
                onClick={handleExportExcel}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                onClick={handleExportPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
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
          />
        )}

        {userRole === 'admin' && (
          <AdminReports
            dateRange={dateRange}
          />
        )}

        {userRole === 'superadmin' && (
          <SuperAdminReports
            dateRange={dateRange}
          />
        )}
      </div>
    </div>
  );
}