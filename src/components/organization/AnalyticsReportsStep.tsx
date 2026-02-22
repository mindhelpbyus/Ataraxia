import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { BarChart3 } from 'lucide-react';
import { StepProps } from './types';

export function AnalyticsReportsStep({ formData, updateFormData }: StepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Analytics & Reporting</h2>
                <p className="text-muted-foreground">Configure dashboards and reports</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Enabled Reports
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Revenue Dashboard</Label>
                        <Switch
                            checked={formData.revenueReports}
                            onCheckedChange={(checked) => updateFormData('revenueReports', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Clinical Outcomes</Label>
                        <Switch
                            checked={formData.clinicalOutcomes}
                            onCheckedChange={(checked) => updateFormData('clinicalOutcomes', checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label>Analytics Enabled</Label>
                        <Switch
                            checked={formData.analyticsEnabled}
                            onCheckedChange={(checked) => updateFormData('analyticsEnabled', checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
