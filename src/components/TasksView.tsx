import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ListChecks, Plus, Funnel, CheckCircle, Clock, Warning } from '@phosphor-icons/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  completed: boolean;
  type: 'follow-up' | 'documentation' | 'admin' | 'review';
}

interface TasksViewProps {
  userRole?: string;
}

export function TasksView({ userRole }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete session notes for Sarah Johnson', priority: 'high', dueDate: '2025-10-10', completed: false, type: 'documentation' },
    { id: '2', title: 'Follow up with Michael Chen via email', priority: 'medium', dueDate: '2025-10-11', completed: false, type: 'follow-up' },
    { id: '3', title: 'Review treatment plan for Emily Rodriguez', priority: 'medium', dueDate: '2025-10-12', completed: false, type: 'review' },
    { id: '4', title: 'Submit insurance claim for Robert Taylor', priority: 'low', dueDate: '2025-10-15', completed: false, type: 'admin' },
    { id: '5', title: 'Prepare intake paperwork for new client', priority: 'high', dueDate: '2025-10-10', completed: false, type: 'admin' },
    { id: '6', title: 'Review and sign supervision notes', priority: 'medium', dueDate: '2025-10-13', completed: true, type: 'documentation' },
    { id: '7', title: 'Call pharmacy for Jessica Martinez prescription', priority: 'high', dueDate: '2025-10-10', completed: false, type: 'follow-up' },
    { id: '8', title: 'Update treatment goals for Christopher Lee', priority: 'low', dueDate: '2025-10-14', completed: false, type: 'review' },
  ]);

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'documentation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'follow-up':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admin':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'review':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'documentation':
        return <CheckCircle className="h-3.5 w-3.5" weight="duotone" />;
      case 'follow-up':
        return <Clock className="h-3.5 w-3.5" weight="duotone" />;
      case 'admin':
        return <ListChecks className="h-3.5 w-3.5" weight="duotone" />;
      case 'review':
        return <Warning className="h-3.5 w-3.5" weight="duotone" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterStatus === 'pending' && task.completed) return false;
    }
    if (filterType !== 'all' && task.type !== filterType) return false;
    return true;
  });

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.completed);

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto px-6 py-6 space-y-6" style={{ maxWidth: '1800px' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <ListChecks className="h-6 w-6 text-cyan-600" weight="duotone" />
              </div>
              Tasks & To-Do
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your daily tasks and action items
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" weight="bold" />
            Add New Task
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Pending Tasks</CardTitle>
              <ListChecks className="h-4 w-4 text-blue-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {highPriorityTasks.length} high priority
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Overdue</CardTitle>
              <Warning className="h-4 w-4 text-red-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-foreground">
                {tasks.filter(t => !t.completed && t.dueDate && isOverdue(t.dueDate)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Funnel className="h-5 w-5 text-muted-foreground" weight="duotone" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterPriority('all');
                  setFilterStatus('all');
                  setFilterType('all');
                }}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" weight="duotone" />
                <p>No tasks match your filters</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 ${task.completed
                      ? 'bg-muted/30 opacity-60 border-border'
                      : task.dueDate && isOverdue(task.dueDate)
                        ? 'border-red-200 bg-red-50/50'
                        : 'bg-background border-border hover:border-primary/50'
                    } transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium mb-2 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(task.type)} flex items-center gap-1`}>
                          {getTypeIcon(task.type)}
                          {task.type}
                        </Badge>
                        {task.dueDate && (
                          <span className={`text-xs flex items-center gap-1 ${isOverdue(task.dueDate) && !task.completed
                              ? 'text-red-600 font-medium'
                              : 'text-muted-foreground'
                            }`}>
                            <Clock className="h-3 w-3" weight="duotone" />
                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {isOverdue(task.dueDate) && !task.completed && ' (Overdue)'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
