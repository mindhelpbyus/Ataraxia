import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  Phone, 
  EnvelopeSimple, 
  MapPin, 
  CalendarBlank,
  FileText,
  Warning,
  TrendUp,
  Heart
} from '@phosphor-icons/react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  diagnosis: string;
  treatmentPlan: string;
  sessionNotes: SessionNote[];
  medications: string[];
  allergies: string[];
  lastSession: string;
  nextSession: string;
  totalSessions: number;
  trend: 'improving' | 'stable' | 'concern';
}

interface SessionNote {
  id: string;
  date: string;
  type: string;
  summary: string;
  observations: string;
  nextSteps: string;
}

interface ClientDetailsSidebarProps {
  client: ClientDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientDetailsSidebar({ client, isOpen, onClose }: ClientDetailsSidebarProps) {
  if (!client) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrendColor = (trend: ClientDetails['trend']) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stable':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concern':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getTrendIcon = (trend: ClientDetails['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendUp className="h-4 w-4" weight="bold" />;
      case 'stable':
        return <span className="text-lg">→</span>;
      case 'concern':
        return <Warning className="h-4 w-4" weight="bold" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Client Details</SheetTitle>
          <SheetDescription>
            Review client information before your session
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Client Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-foreground">{client.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Client ID: {client.id}</p>
              <Badge variant="outline" className={`capitalize ${getTrendColor(client.trend)}`}>
                <span className="mr-1">{getTrendIcon(client.trend)}</span>
                {client.trend}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" weight="duotone" />
              Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <EnvelopeSimple className="h-4 w-4" weight="duotone" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" weight="duotone" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" weight="duotone" />
                <span>{client.address}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
              <p className="text-2xl font-semibold text-foreground">{client.totalSessions}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Last Session</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(client.lastSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" weight="duotone" />
              Medical Information
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Diagnosis</p>
                <p className="text-foreground">{client.diagnosis}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Medications</p>
                <div className="flex flex-wrap gap-1">
                  {client.medications.map((med, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
              {client.allergies.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {client.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Treatment Plan */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" weight="duotone" />
              Treatment Plan
            </h4>
            <p className="text-sm text-muted-foreground">{client.treatmentPlan}</p>
          </div>

          <Separator />

          {/* Recent Session Notes */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <CalendarBlank className="h-4 w-4 text-muted-foreground" weight="duotone" />
              Recent Session Notes
            </h4>
            <div className="space-y-3">
              {client.sessionNotes.slice(0, 3).map((note) => (
                <div key={note.id} className="p-3 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(note.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <Badge variant="outline" className="text-xs">{note.type}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Summary</p>
                    <p className="text-sm text-foreground">{note.summary}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Observations</p>
                    <p className="text-sm text-foreground">{note.observations}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Next Steps</p>
                    <p className="text-sm text-foreground">{note.nextSteps}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1">
              View Full History
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
