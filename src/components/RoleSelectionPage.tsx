import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { UserRole } from '../types/appointment';
import { Calendar, Users, User, LogOut } from 'lucide-react';

interface RoleSelectionPageProps {
  onRoleSelected: (role: UserRole, userId: string) => void;
  onLogout: () => void;
  userEmail: string;
}

export function RoleSelectionPage({ onRoleSelected, onLogout, userEmail }: RoleSelectionPageProps) {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [currentUserId, setCurrentUserId] = useState('1');

  // Mock therapist data for role selection
  const therapistOptions = [
    { id: '1', name: 'Dr. Sarah Johnson' },
    { id: '2', name: 'Dr. Michael Chen' },
    { id: '3', name: 'Dr. Emily Rodriguez' },
    { id: '4', name: 'Dr. David Thompson' },
    { id: '5', name: 'Dr. Jessica Williams' },
    { id: '6', name: 'Dr. Robert Martinez' },
    { id: '7', name: 'Dr. Lisa Anderson' },
    { id: '8', name: 'Dr. Mark Taylor' },
  ];

  const handleRoleSelection = () => {
    onRoleSelected(userRole, currentUserId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      {/* Logout Button */}
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Wellness Calendar</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium text-foreground">{userEmail}</span>
          </CardDescription>
          <CardDescription className="mt-2">
            Choose your role to access the calendar system
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Role</label>
            <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div>Wellness Admin</div>
                      <div className="text-xs text-muted-foreground">
                        View all therapists' calendars
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="therapist">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div>Individual Therapist</div>
                      <div className="text-xs text-muted-foreground">
                        View your own calendar only
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Therapist Selection (only for therapist role) */}
          {userRole === 'therapist' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Therapist</label>
              <Select value={currentUserId} onValueChange={setCurrentUserId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {therapistOptions.map(therapist => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Role Description */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              {userRole === 'admin' ? (
                <Users className="h-5 w-5 text-primary mt-0.5" />
              ) : (
                <User className="h-5 w-5 text-primary mt-0.5" />
              )}
              <div className="text-sm">
                {userRole === 'admin' ? (
                  <>
                    <div className="font-medium mb-1">Admin Features:</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• View multiple therapists side-by-side</li>
                      <li>• Filter calendars by therapist</li>
                      <li>• Manage all appointments</li>
                      <li>• Day, Week, and Month views</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="font-medium mb-1">Therapist Features:</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• View your own calendar only</li>
                      <li>• Book, edit, and delete appointments</li>
                      <li>• Add breaks and lunch sessions</li>
                      <li>• Day, Week, and Month views</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleRoleSelection} className="w-full">
            Access Calendar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
