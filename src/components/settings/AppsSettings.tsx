import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Calendar, Slack, CreditCard, Camera, Check } from "lucide-react";
import { SettingsSection } from './SettingsSection';

export const AppsSettings: React.FC = () => {
    return (
        <div className="max-w-5xl pl-6 pb-20 pt-0">
            <SettingsSection>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { name: 'Google Calendar', desc: 'Sync appointments and availability.', icon: Calendar, connected: true, color: 'text-error-foreground', bg: 'bg-error/10' },
                        { name: 'Slack', desc: 'Receive notifications in your team channel.', icon: Slack, connected: false, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
                        { name: 'Stripe', desc: 'Process client payments securely.', icon: CreditCard, connected: true, color: 'text-primary', bg: 'bg-primary/10' },
                        { name: 'Zoom', desc: 'Launch video sessions directly.', icon: Camera, connected: true, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
                    ].map((app, i) => (
                        <Card key={i} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border bg-card">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl ${app.bg} flex items-center justify-center`}>
                                        <app.icon className={`w-8 h-8 ${app.color}`} />
                                    </div>
                                    {app.connected ? (
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100"><Check className="w-3 h-3 mr-1" /> Connected</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-foreground mb-1">{app.name}</h3>
                                <p className="text-sm text-muted-foreground">{app.desc}</p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                {app.connected ? (
                                    <Button variant="outline" className="w-full border-border">Configure</Button>
                                ) : (
                                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">Connect</Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </SettingsSection>
        </div>
    );
};
