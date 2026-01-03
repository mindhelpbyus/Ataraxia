import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from './ui/button';

interface MiniCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function MiniCalendar({ currentDate, onDateChange, onNavigate }: MiniCalendarProps) {
  const today = new Date();
  
  // Get first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get starting date for calendar grid (including previous month days)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // Generate calendar days
  const calendarDays = [];
  const currentDateForLoop = new Date(startDate);
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    calendarDays.push(new Date(currentDateForLoop));
    currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  const isSelected = (date: Date) => {
    return date.toDateString() === currentDate.toDateString();
  };

  return (
    <div className="p-4 bg-sidebar border-b border-sidebar-border">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sidebar-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-sidebar-accent text-sidebar-foreground"
            onClick={() => onNavigate('prev')}
          >
            <CaretLeft className="h-4 w-4" weight="bold" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-sidebar-accent text-sidebar-foreground"
            onClick={() => onNavigate('next')}
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </Button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-xs text-sidebar-foreground/60 text-center p-1 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.slice(0, 35).map((date, index) => { // Show only 5 weeks for compact view
          const today = isToday(date);
          const selected = isSelected(date);
          const currentMonth = isCurrentMonth(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateChange(date)}
              className={`
                text-xs h-7 w-7 rounded-md transition-colors font-medium
                flex items-center justify-center relative
                ${!currentMonth ? 'text-sidebar-foreground/40' : 'text-sidebar-foreground'}
                ${today ? 'bg-[#0176d3] text-white hover:bg-[#0176d3] font-semibold' : 'hover:bg-sidebar-accent'}
                ${selected && !today ? 'ring-2 ring-[#0176d3] bg-sidebar-accent' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}