import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { FileSignature, UserCircle, ShieldCheck, Siren, Scale, FileText } from "lucide-react";
import { cn } from '../ui/utils';

export const DocumentSettings: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in">
            <div className="mb-10 pt-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Document & Consents</h1>
            </div>

            <div className="grid gap-6">
                {[
                    {
                        title: "Therapist Onboarding Agreement",
                        desc: "India law compliant, RCI-aligned agreement covering scope-of-practice and platform liability.",
                        icon: FileSignature,
                        status: "Signed",
                        date: "Feb 07, 2026",
                        badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
                        tags: ["RCI-Aligned", "Liability Shield"]
                    },
                    {
                        title: "Patient Informed Consent",
                        desc: "Tele-Mental Health consent compliant with Mental Healthcare Act, 2017.",
                        icon: UserCircle,
                        status: "Active",
                        date: "Rev. 1.2",
                        badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
                        tags: ["Tele-Health", "Risk Disclosure"]
                    },
                    {
                        title: "Privacy & Data Protection Policy",
                        desc: "DPDP Act, 2023 & IT Act, 2000 compliant policy. Referenced ISO 27001 & HIPAA standards.",
                        icon: ShieldCheck,
                        status: "Active",
                        date: "Rev. 2.0",
                        badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
                        tags: ["DPDP 2023", "ISO 27001"]
                    },
                    {
                        title: "Crisis & Emergency Protocol",
                        desc: "Mandatory suicide risk handling, duty to protect, and confidentiality break conditions.",
                        icon: Siren,
                        status: "Review Required",
                        date: "Action Needed",
                        badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
                        tags: ["Emergency Duty", "Suicide Prevention"]
                    },
                    {
                        title: "Ethics & Code of Conduct",
                        desc: "Adherence to RCI Code of Ethics, boundary rules, and non-discrimination policies.",
                        icon: Scale,
                        status: "Acknowledged",
                        date: "Jan 15, 2026",
                        badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
                        tags: ["RCI Ethics", "Boundaries"]
                    }
                ].map((doc, i) => (
                    <Card key={i} className="group hover:shadow-md transition-all duration-200 border-border overflow-hidden">
                        <div className="p-6 grid sm:grid-cols-[1fr_auto] gap-6 items-start">
                            <div className="flex gap-5">
                                <div className="flex-shrink-0 pt-1">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <doc.icon className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className="font-semibold text-lg text-foreground">{doc.title}</h3>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                                        {doc.desc}
                                    </p>

                                    <div className="flex flex-wrap gap-2 pt-1 items-center">
                                        <Badge variant="outline" className={cn("px-2.5 py-0.5 font-medium border", doc.badgeColor)}>
                                            {doc.status}
                                        </Badge>
                                        {doc.tags.map((tag, t) => (
                                            <span key={t} className="inline-flex items-center px-2 py-1 rounded-md bg-muted/50 text-xs font-medium text-muted-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-3 min-w-[140px] pt-1">
                                <div className="text-xs text-muted-foreground font-medium text-right">
                                    {doc.date}
                                </div>
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" className="w-full justify-center border-orange-200 hover:bg-orange-50 hover:text-orange-700 font-medium h-9">
                                        <FileText className="w-4 h-4 mr-2" />
                                        View
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-center text-muted-foreground hover:text-foreground h-9">
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
