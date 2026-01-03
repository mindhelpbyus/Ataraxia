import React from 'react';
import { Appointment, Therapist } from '../types/appointment';
import { Clock, User, Flag, AlertCircle } from 'lucide-react';
import { useDrag } from 'react-dnd';
import { Badge } from './ui/badge';

interface EnhancedAppointmentCardProps {
  appointment: Appointment;
  therapist?: Therapist;
  onClick: (e?: React.MouseEvent) => void;
  showTherapistName?: boolean;
  style?: React.CSSProperties;
  className?: string;
  view?: 'day' | 'week' | 'month';
}

export function EnhancedAppointmentCard({ 
  appointment, 
  therapist, 
  onClick, 
  showTherapistName = false,
  style = {},
  className = ''
}: EnhancedAppointmentCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'appointment',
    item: { appointment },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
    }
  };

  const getStatusColor = () => {
    if (appointment.type === 'break') return 'bg-gray-100 border-gray-300 text-gray-800';
    if (appointment.status === 'pending') return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (appointment.type === 'internal') return 'bg-purple-50 border-purple-200 text-purple-900';
    if (appointment.type === 'external') return 'bg-teal-50 border-teal-200 text-teal-900';
    return 'bg-white border-gray-200 text-gray-900';
  };

  const isBreak = appointment.type === 'break';
  const isInternalOrExternal = appointment.type === 'internal' || appointment.type === 'external';

  const getAccentColor = () => {
    if (appointment.type === 'break') return '#6b7280';
    // Use custom color if set, otherwise fall back to therapist color
    return appointment.customColor || appointment.color || therapist?.color || '#0176d3';
  };

  const getTypeBadgeColor = () => {
    switch (appointment.type) {
      case 'break':
        return 'bg-gray-600 text-white';
      case 'internal':
        return 'bg-[#9050e9] text-white';
      case 'external':
        return 'bg-[#06a59a] text-white';
      default:
        return 'bg-[#0176d3] text-white';
    }
  };

  const getTypeLabel = () => {
    switch (appointment.type) {
      case 'break':
        return 'BREAK';
      case 'internal':
        return 'INTERNAL';
      case 'external':
        return 'EXTERNAL';
      default:
        return null;
    }
  };

  return (
    <div
      ref={drag}
      onClick={onClick}
      style={{
        ...style,
        borderLeftWidth: '4px',
        borderLeftColor: getAccentColor(),
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isBreak ? '#9CA3AF' : (appointment.status === 'tentative' ? '#DBEAFE' : undefined),
      }}
      className={`
        ${getStatusColor()}
        border rounded-md p-2.5 cursor-pointer transition-all duration-200
        hover:shadow-md hover:ring-2 hover:ring-[#0176d3]/20 active:scale-95
        ${className}
      `}
    >
      <div className="space-y-1.5 relative">
        {/* Header with Type Badge and Flag */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {getTypeLabel() && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getTypeBadgeColor()}`}>
                {getTypeLabel()}
              </span>
            )}
            {appointment.status === 'pending' && (
              <Badge variant="yellow" size="sm">
                Pending
              </Badge>
            )}
          </div>
          
          {/* Flag Indicator */}
          {appointment.flagged && (
            <div className="shrink-0" title={appointment.flagNote || 'Flagged for follow-up'}>
              <Flag className="h-4 w-4 text-[#ea001e] fill-[#ea001e]" />
            </div>
          )}
        </div>

        {/* Title - NO STRIKETHROUGH for internal/external */}
        <div className="font-medium text-sm leading-tight">
          {appointment.title}
        </div>
        
        {/* Time and Duration */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            <span>{formatTime(appointment.startTime)}</span>
          </div>
          <span className="opacity-60">•</span>
          <span className="opacity-80">{getDuration()}</span>
        </div>
        
        {/* Client/Therapist Info */}
        {appointment.type === 'appointment' && (
          <div className="flex items-center gap-1 text-xs opacity-80">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{appointment.clientName || 'Client'}</span>
          </div>
        )}
        
        {showTherapistName && therapist && (
          <div className="flex items-center gap-1 text-xs opacity-80">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getAccentColor() }}
            />
            <span className="truncate">{therapist.name}</span>
          </div>
        )}

        {/* Custom Color Indicator */}
        {appointment.customColor && (
          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <div 
              className="w-3 h-3 rounded-full border border-white shadow-sm" 
              style={{ backgroundColor: appointment.customColor }}
            />
            <span className="text-xs">Custom color</span>
          </div>
        )}
      </div>
    </div>
  );
}