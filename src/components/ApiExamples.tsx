/**
 * API Usage Examples
 * Demonstrates how to use the backend API in React components
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useApiCall, useMutation } from '../hooks/useApi';
import { 
  getTherapistAppointments, 
  createAppointment,
  CreateAppointmentRequest 
} from '../api/appointmentsBackend';
import { 
  getWaitingParticipants,
  approveParticipant
} from '../api/waitingRoom';
import { checkHealth } from '../api/health';
import { toast } from 'sonner';

/**
 * Example 1: Authentication
 */
export function AuthExample() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'therapist' | 'client' | 'admin'>('therapist');

  const handleLogin = async () => {
    try {
      await login(userId, email, role);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <h3 className="mb-4">Authentication Example</h3>
      {!isAuthenticated ? (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="User ID (e.g., USR-12345)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'therapist' | 'client' | 'admin')}
            className="w-full p-2 border rounded"
          >
            <option value="therapist">Therapist</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </div>
      ) : (
        <div>
          <p>Welcome, {user?.name}!</p>
          <p>Role: {user?.role}</p>
          <Button onClick={logout} variant="outline" className="mt-4">
            Logout
          </Button>
        </div>
      )}
    </Card>
  );
}

/**
 * Example 2: Fetching Data with useApiCall
 */
export function AppointmentsListExample({ therapistId }: { therapistId: string }) {
  const { data, loading, error, refetch } = useApiCall(
    () => getTherapistAppointments(therapistId, {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }),
    [therapistId],
    {
      onSuccess: (data) => {
        console.log('Loaded appointments:', data);
      },
      onError: (error) => {
        toast.error(`Failed to load appointments: ${error.message}`);
      }
    }
  );

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || data.length === 0) return <div>No appointments</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3>Appointments</h3>
        <Button onClick={refetch} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      <ul className="space-y-2">
        {data.map((apt) => (
          <li key={apt.id} className="p-3 border rounded">
            <div className="font-medium">{apt.title}</div>
            <div className="text-sm text-gray-600">
              {new Date(apt.startTime).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * Example 3: Creating Data with useMutation
 */
export function CreateAppointmentExample() {
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    therapistId: 'therapist-1',
    clientId: 'client-1',
    title: 'Therapy Session',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    type: 'video'
  });

  const { mutate, loading } = useMutation(
    createAppointment,
    {
      onSuccess: (data) => {
        toast.success('Appointment created successfully!');
        console.log('Created appointment:', data);
      },
      onError: (error) => {
        toast.error(`Failed to create appointment: ${error.message}`);
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4">Create Appointment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full p-2 border rounded"
        >
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="in-person">In Person</option>
        </select>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Appointment'}
        </Button>
      </form>
    </Card>
  );
}

/**
 * Example 4: Session Management
 */
export function SessionExample() {
  const { session, loading, create, join, end } = useSession();

  const handleCreateSession = async () => {
    try {
      await create({
        title: 'Test Session',
        participants: [
          {
            userId: 'therapist-1',
            role: 'moderator',
            name: 'Dr. Sarah',
            email: 'sarah@example.com'
          }
        ],
        settings: {
          waitingRoomEnabled: true,
          recordingEnabled: true,
          chatEnabled: true,
          screenSharingEnabled: true
        }
      });
      toast.success('Session created!');
    } catch (error) {
      toast.error('Failed to create session');
    }
  };

  const handleJoinSession = async () => {
    if (!session) return;
    try {
      await join({
        sessionId: session.id,
        userName: 'Dr. Sarah',
        userEmail: 'sarah@example.com'
      });
      toast.success('Joined session!');
    } catch (error) {
      toast.error('Failed to join session');
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4">Session Management</h3>
      {!session ? (
        <Button onClick={handleCreateSession} disabled={loading}>
          Create Session
        </Button>
      ) : (
        <div className="space-y-4">
          <div>
            <p><strong>Session ID:</strong> {session.id}</p>
            <p><strong>Room:</strong> {session.roomName}</p>
            <p><strong>Status:</strong> {session.status}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleJoinSession} disabled={loading}>
              Join
            </Button>
            <Button onClick={end} variant="destructive" disabled={loading}>
              End Session
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Example 5: Waiting Room Management
 */
export function WaitingRoomExample({ sessionId }: { sessionId: string }) {
  const { data: participants, loading, refetch } = useApiCall(
    () => getWaitingParticipants(sessionId),
    [sessionId]
  );

  const { mutate: approve, loading: approving } = useMutation(
    ({ userId }: { userId: string }) => approveParticipant(sessionId, userId),
    {
      onSuccess: () => {
        toast.success('Participant approved');
        refetch();
      }
    }
  );

  if (loading) return <div>Loading waiting room...</div>;
  if (!participants || participants.length === 0) {
    return <div>No participants waiting</div>;
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4">Waiting Room ({participants.length})</h3>
      <ul className="space-y-2">
        {participants.map((p) => (
          <li key={p.userId} className="flex justify-between items-center p-3 border rounded">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.email}</div>
            </div>
            <Button
              onClick={() => approve({ userId: p.userId })}
              disabled={approving || p.status === 'approved'}
              size="sm"
            >
              {p.status === 'approved' ? 'Approved' : 'Approve'}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * Example 6: Health Check
 */
export function HealthCheckExample() {
  const { data, loading, error, refetch } = useApiCall(
    checkHealth,
    [],
    { immediate: false }
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3>API Health Check</h3>
        <Button onClick={refetch} disabled={loading} size="sm">
          {loading ? 'Checking...' : 'Check Health'}
        </Button>
      </div>
      {error && <div className="text-red-600">Error: {error.message}</div>}
      {data && (
        <div className="space-y-2">
          <div>
            <strong>Status:</strong>{' '}
            <span className={data.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
              {data.status.toUpperCase()}
            </span>
          </div>
          <div><strong>Version:</strong> {data.version}</div>
          <div><strong>Uptime:</strong> {Math.floor(data.uptime / 60)} minutes</div>
          <div>
            <strong>Services:</strong>
            <ul className="ml-4 mt-2 space-y-1">
              <li>Database: {data.services.database ? '✅' : '❌'}</li>
              <li>Storage: {data.services.storage ? '✅' : '❌'}</li>
              <li>Jitsi: {data.services.jitsi ? '✅' : '❌'}</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Main Demo Component
 */
export default function ApiExamples() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1>API Integration Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AuthExample />
        <HealthCheckExample />
        <AppointmentsListExample therapistId="therapist-1" />
        <CreateAppointmentExample />
        <SessionExample />
      </div>
    </div>
  );
}
