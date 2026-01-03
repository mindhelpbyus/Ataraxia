import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Resizable } from 're-resizable';
import { Plus, Trash, PushPin, Palette, X, FloppyDisk, XCircle } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface StickyNote {
  id: string;
  content: string;
  color: string;
  isPinned: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

const noteColors = [
  { name: 'Yellow', bg: '#fef3c7', border: '#fde047', shadow: 'rgba(250, 204, 21, 0.3)' },
  { name: 'Pink', bg: '#fce7f3', border: '#f9a8d4', shadow: 'rgba(244, 114, 182, 0.3)' },
  { name: 'Blue', bg: '#dbeafe', border: '#93c5fd', shadow: 'rgba(96, 165, 250, 0.3)' },
  { name: 'Green', bg: '#d1fae5', border: '#6ee7b7', shadow: 'rgba(52, 211, 153, 0.3)' },
  { name: 'Purple', bg: '#e9d5ff', border: '#c084fc', shadow: 'rgba(168, 85, 247, 0.3)' },
  { name: 'Orange', bg: '#fed7aa', border: '#fdba74', shadow: 'rgba(251, 146, 60, 0.3)' },
  { name: 'Red', bg: '#fee2e2', border: '#fca5a5', shadow: 'rgba(248, 113, 113, 0.3)' },
  { name: 'Teal', bg: '#ccfbf1', border: '#5eead4', shadow: 'rgba(45, 212, 191, 0.3)' },
];

const STORAGE_KEY = 'yodha_sticky_notes';

// Load notes from localStorage
const loadNotesFromStorage = (): StickyNote[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
  }
  
  // Default notes if nothing in storage
  return [
    {
      id: '1',
      content: 'Remember to follow up with Sarah about anxiety management techniques',
      color: 'Yellow',
      isPinned: true,
      x: 50,
      y: 50,
      width: 280,
      height: 200,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      content: 'Order new mindfulness workbooks for group therapy sessions',
      color: 'Blue',
      isPinned: false,
      x: 380,
      y: 50,
      width: 280,
      height: 180,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '3',
      content: 'Research new CBT techniques for treating social anxiety',
      color: 'Green',
      isPinned: true,
      x: 710,
      y: 50,
      width: 280,
      height: 200,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];
};

// Save notes to localStorage
const saveNotesToStorage = (notes: StickyNote[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
};

interface DraggableNoteProps {
  note: StickyNote;
  onUpdate: (id: string, updates: Partial<StickyNote>) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  zIndex: number;
}

function DraggableNote({ note, onUpdate, onDelete, onBringToFront, zIndex }: DraggableNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [{ opacity }, drag] = useDrag({
    type: 'sticky-note',
    item: () => {
      setIsDragging(true);
      return { id: note.id, x: note.x, y: note.y };
    },
    end: (item, monitor) => {
      setIsDragging(false);
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newX = Math.max(0, note.x + delta.x);
        const newY = Math.max(0, note.y + delta.y);
        onUpdate(note.id, { x: newX, y: newY });
      }
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onBringToFront(note.id);
  };

  const handleSave = () => {
    if (editContent.trim() !== note.content) {
      onUpdate(note.id, { content: editContent.trim(), updatedAt: new Date().toISOString() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    // Optional: Allow Cmd/Ctrl+Enter as a shortcut for quick save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const handleColorChange = (colorName: string) => {
    onUpdate(note.id, { color: colorName, updatedAt: new Date().toISOString() });
  };

  const colorConfig = noteColors.find(c => c.name === note.color) || noteColors[0];

  const handleMouseDown = () => {
    onBringToFront(note.id);
  };

  return (
    <Resizable
      size={{ width: note.width, height: note.height }}
      onResizeStop={(e, direction, ref, d) => {
        onUpdate(note.id, {
          width: note.width + d.width,
          height: note.height + d.height,
        });
      }}
      minWidth={200}
      minHeight={150}
      maxWidth={600}
      maxHeight={600}
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        opacity,
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={(node) => {
          drag(node);
          if (noteRef.current !== node) {
            noteRef.current = node;
          }
        }}
        className="h-full w-full flex flex-col shadow-lg rounded-lg overflow-hidden group cursor-move"
        style={{
          backgroundColor: colorConfig.bg,
          borderLeft: `4px solid ${colorConfig.border}`,
          boxShadow: isDragging 
            ? `0 20px 25px -5px ${colorConfig.shadow}, 0 10px 10px -5px ${colorConfig.shadow}`
            : `0 4px 6px -1px ${colorConfig.shadow}, 0 2px 4px -1px ${colorConfig.shadow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
          <div className="flex items-center gap-1.5">
            {note.isPinned && !isEditing && (
              <PushPin className="h-3.5 w-3.5 text-foreground/60" weight="fill" />
            )}
            {isEditing && (
              <span className="text-xs text-foreground/60 font-medium">Editing</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                  title="Cancel (Esc)"
                >
                  <XCircle className="h-4 w-4 text-red-600" weight="bold" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1.5 rounded bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  title="Save changes"
                >
                  <FloppyDisk className="h-4 w-4 text-green-700" weight="bold" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 rounded hover:bg-black/10 transition-colors"
                      title="Change color"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Palette className="h-3.5 w-3.5 text-foreground/80" weight="regular" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <div className="grid grid-cols-4 gap-1.5 p-2">
                      {noteColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleColorChange(color.name)}
                          className="w-8 h-8 rounded-md border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: color.bg,
                            borderColor: note.color === color.name ? '#000' : 'transparent',
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}
                  className={`p-1 rounded hover:bg-black/10 transition-colors ${
                    note.isPinned ? 'bg-black/10' : ''
                  }`}
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <PushPin 
                    className="h-3.5 w-3.5 text-foreground/80" 
                    weight={note.isPinned ? "fill" : "regular"}
                  />
                </button>
                <button
                  onClick={() => onDelete(note.id)}
                  className="p-1 rounded hover:bg-red-500/20 transition-colors"
                  title="Delete"
                >
                  <Trash className="h-3.5 w-3.5 text-red-600" weight="regular" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 overflow-hidden">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none bg-transparent outline-none text-sm leading-relaxed text-foreground/90"
              style={{ fontFamily: 'inherit' }}
              placeholder="Type your note here..."
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="w-full h-full text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90 cursor-text"
            >
              {note.content || 'Double-click to edit...'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 text-xs text-foreground/50 border-t border-black/5">
          {isEditing ? (
            <span className="italic">Click the save icon to save changes</span>
          ) : (
            <span>Double-click to edit</span>
          )}
        </div>
      </div>
    </Resizable>
  );
}

export function QuickNotesView() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [noteOrder, setNoteOrder] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const loadedNotes = loadNotesFromStorage();
    setNotes(loadedNotes);
    setNoteOrder(loadedNotes.map(n => n.id));
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotesToStorage(notes);
    }
  }, [notes]);

  const handleCreateNote = () => {
    // Get canvas dimensions
    const canvas = canvasRef.current;
    const canvasRect = canvas?.getBoundingClientRect();
    
    // Random position within visible area
    const randomX = Math.random() * ((canvasRect?.width || 1000) - 300) + 20;
    const randomY = Math.random() * 300 + 50;
    
    // Random color
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)].name;

    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      color: randomColor,
      isPinned: false,
      x: randomX,
      y: randomY,
      width: 280,
      height: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([...notes, newNote]);
    setNoteOrder([...noteOrder, newNote.id]);
  };

  const handleUpdateNote = (id: string, updates: Partial<StickyNote>) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    setNoteOrder(noteOrder.filter(nid => nid !== id));
  };

  const handleBringToFront = (id: string) => {
    setNoteOrder([...noteOrder.filter(nid => nid !== id), id]);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
      setNotes([]);
      setNoteOrder([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="mb-0.5">Sticky Notes Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag to move, resize corners, double-click to edit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
          {notes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="gap-2"
            >
              <Trash className="h-4 w-4" weight="bold" />
              Clear All
            </Button>
          )}
          <Button onClick={handleCreateNote} size="sm" className="gap-2">
            <Plus className="h-4 w-4" weight="bold" />
            New Note
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto relative"
        style={{
          backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2">No sticky notes yet</h3>
              <p className="text-sm mb-4 max-w-md">
                Click "New Note" to create your first sticky note. You can drag to move, resize, and double-click to edit.
              </p>
              <Button onClick={handleCreateNote} className="gap-2">
                <Plus className="h-4 w-4" weight="bold" />
                Create First Note
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative min-h-full min-w-full p-4">
            {noteOrder.map((noteId, index) => {
              const note = notes.find(n => n.id === noteId);
              if (!note) return null;
              
              return (
                <DraggableNote
                  key={note.id}
                  note={note}
                  onUpdate={handleUpdateNote}
                  onDelete={handleDeleteNote}
                  onBringToFront={handleBringToFront}
                  zIndex={index + 1}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
