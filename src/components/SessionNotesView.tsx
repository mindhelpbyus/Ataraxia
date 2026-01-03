import React, { useState } from 'react';
import { Edit, Search, Filter, Plus, Calendar, User, Clock, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface SessionNote {
  id: string;
  clientId: string;
  clientName: string;
  sessionDate: string;
  sessionType: string;
  duration: string;
  notes: string;
  interventions: string[];
  progress: string;
  nextSteps: string;
  mood: 'improved' | 'stable' | 'declined';
  createdAt: string;
}

const mockNotes: SessionNote[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Sarah Johnson',
    sessionDate: '2025-10-08',
    sessionType: 'Therapy Session',
    duration: '50 minutes',
    notes: 'Client reported significant progress in managing anxiety symptoms this week. Discussed stress management techniques and their application in work situations. Client demonstrated good understanding and engagement.',
    interventions: ['Cognitive Behavioral Therapy', 'Breathing Exercises', 'Thought Journaling'],
    progress: 'Client shows continued improvement. Anxiety levels decreased from 7/10 to 4/10. Successfully applied techniques learned in previous sessions.',
    nextSteps: 'Continue current treatment plan. Client to practice mindfulness exercises daily and maintain thought journal. Schedule follow-up in one week.',
    mood: 'improved',
    createdAt: '2025-10-08T14:30:00'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Michael Chen',
    sessionDate: '2025-10-09',
    sessionType: 'EMDR Session',
    duration: '60 minutes',
    notes: 'EMDR session focused on processing traumatic memory related to military service. Client showed good tolerance of bilateral stimulation. Some emotional activation during processing phase.',
    interventions: ['EMDR Therapy', 'Grounding Techniques', 'Safe Place Visualization'],
    progress: 'Successfully completed one target memory. Client reported feeling lighter after processing. SUD level decreased from 8/10 to 3/10.',
    nextSteps: 'Continue EMDR protocol. Address related memories in next session. Client to practice safe place visualization between sessions.',
    mood: 'stable',
    createdAt: '2025-10-09T11:00:00'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Emily Rodriguez',
    sessionDate: '2025-10-07',
    sessionType: 'Art Therapy',
    duration: '50 minutes',
    notes: 'Client engaged in art therapy using watercolors. Created piece expressing current emotional state. Facilitated discussion about mood cycles and creative expression as coping mechanism.',
    interventions: ['Art Therapy', 'Emotion Regulation', 'Mood Tracking'],
    progress: 'Client demonstrated good insight into mood patterns. Art expression provided valuable outlet for emotions. Mood has been stable this week.',
    nextSteps: 'Continue art therapy approach. Review mood journal at next session. Discuss strategies for maintaining stability during stressful periods.',
    mood: 'stable',
    createdAt: '2025-10-07T15:00:00'
  },
  {
    id: '4',
    clientId: '5',
    clientName: 'Jessica Martinez',
    sessionDate: '2025-10-06',
    sessionType: 'Therapy Session',
    duration: '50 minutes',
    notes: 'Discussed ongoing challenges with parenting stress and financial concerns. Client expressed feeling overwhelmed. Explored problem-solving strategies and available resources.',
    interventions: ['Solution-Focused Therapy', 'Stress Management', 'Resource Identification'],
    progress: 'Client identified several potential resources for childcare support. Developed action plan for addressing immediate concerns. Mood remains low but client is engaged in treatment.',
    nextSteps: 'Follow up on resource connections made. Continue building support network. Monitor mood closely and assess need for medication adjustment.',
    mood: 'stable',
    createdAt: '2025-10-06T10:30:00'
  },
  {
    id: '5',
    clientId: '8',
    clientName: 'Christopher Lee',
    sessionDate: '2025-10-10',
    sessionType: 'ERP Session',
    duration: '60 minutes',
    notes: 'ERP homework review showed good compliance with exposure exercises. Client reported reduced anxiety when encountering triggers. Progressed to next level of exposure hierarchy.',
    interventions: ['Exposure and Response Prevention', 'Anxiety Management', 'Cognitive Restructuring'],
    progress: 'Significant progress in reducing compulsive behaviors. Client able to tolerate higher levels of uncertainty. Rituals decreased by approximately 40%.',
    nextSteps: 'Continue ERP protocol with increased difficulty. Assign new exposure homework. Client to track ritual frequency and anxiety levels.',
    mood: 'improved',
    createdAt: '2025-10-10T09:00:00'
  }
];

export function SessionNotesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [notes] = useState<SessionNote[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getMoodColor = (mood: SessionNote['mood']) => {
    switch (mood) {
      case 'improved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stable':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.sessionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClient = clientFilter === 'all' || note.clientId === clientFilter;
    
    return matchesSearch && matchesClient;
  });

  // Get unique clients for filter
  const uniqueClients = Array.from(new Set(notes.map(n => ({ id: n.clientId, name: n.clientName }))))
    .filter((client, index, self) => self.findIndex(p => p.id === client.id) === index);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-medium leading-8 text-foreground">Session Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Clinical documentation and progress notes
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddingNote(true)}>
            <Plus className="h-4 w-4" weight="bold" />
            Add Session Note
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="bold" />
            <Input
              type="text"
              placeholder="Search by client, session type, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-56">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" weight="bold" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {uniqueClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" weight="duotone" />
              <h3 className="font-medium mb-1">No session notes found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first session note'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="border border-border rounded-lg p-5 hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-white"
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(note.clientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{note.clientName}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" weight="bold" />
                            {formatDate(note.sessionDate)}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" weight="bold" />
                            {note.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline">{note.sessionType}</Badge>
                      <Badge variant="outline" className={getMoodColor(note.mood)}>
                        {note.mood}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-foreground line-clamp-2 mb-3">
                    {note.notes}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {note.interventions.slice(0, 3).map((intervention, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {intervention}
                      </Badge>
                    ))}
                    {note.interventions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{note.interventions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {filteredNotes.length > 0 && (
            <div className="mt-6 text-sm text-muted-foreground text-center">
              Showing {filteredNotes.length} of {notes.length} session notes
            </div>
          )}
        </div>
      </div>

      {/* View Note Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedNote && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(selectedNote.clientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>{selectedNote.clientName}</DialogTitle>
                      <DialogDescription className="flex items-center gap-3 mt-1">
                        <span>{formatDate(selectedNote.sessionDate)}</span>
                        <span>•</span>
                        <span>{selectedNote.sessionType}</span>
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline" className={getMoodColor(selectedNote.mood)}>
                      Mood: {selectedNote.mood}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 mt-6">
                {/* Session Details */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Session Duration</label>
                      <p className="text-sm font-medium">{selectedNote.duration}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Documented</label>
                      <p className="text-sm font-medium">{formatDate(selectedNote.createdAt)} at {formatTime(selectedNote.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Session Notes */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Session Notes</h4>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                    {selectedNote.notes}
                  </p>
                </div>

                {/* Interventions */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Interventions Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.interventions.map((intervention, idx) => (
                      <Badge key={idx} variant="secondary">
                        {intervention}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Progress & Observations</h4>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                    {selectedNote.progress}
                  </p>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Next Steps & Recommendations</h4>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                    {selectedNote.nextSteps}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedNote(null)}>
                  Close
                </Button>
                <Button variant="default" className="gap-2">
                  <Edit className="h-4 w-4" weight="bold" />
                  Edit Note
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Session Note</DialogTitle>
            <DialogDescription>
              Document your therapy session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="therapy">Therapy Session</SelectItem>
                    <SelectItem value="initial">Initial Consultation</SelectItem>
                    <SelectItem value="followup">Follow-up Session</SelectItem>
                    <SelectItem value="emdr">EMDR Session</SelectItem>
                    <SelectItem value="art">Art Therapy</SelectItem>
                    <SelectItem value="group">Group Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Notes</Label>
              <Textarea 
                placeholder="Document what happened during the session, client's presentation, topics discussed..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Interventions Used</Label>
              <Input placeholder="e.g., CBT, Mindfulness, Exposure Therapy" />
            </div>

            <div className="space-y-2">
              <Label>Progress & Observations</Label>
              <Textarea 
                placeholder="Note any progress, changes in symptoms, client insights..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Next Steps</Label>
              <Textarea 
                placeholder="Plan for next session, homework assignments, follow-up items..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Client Mood Assessment</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improved">Improved</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddingNote(false)}>
              Cancel
            </Button>
            <Button variant="default">
              Save Session Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}