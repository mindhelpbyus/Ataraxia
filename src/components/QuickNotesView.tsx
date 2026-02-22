import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Plus,
  Pin,
  Trash2,
  Palette,
  HelpCircle
} from 'lucide-react';

// Types
type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

interface Note {
  id: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  createdAt: Date;
}

// Color configurations matching the image
const noteColors: { [key in NoteColor]: { bg: string; border: string; text: string } } = {
  yellow: { bg: 'bg-yellow-100', border: 'border-l-yellow-400', text: 'text-gray-700' },
  blue: { bg: 'bg-blue-100', border: 'border-l-blue-400', text: 'text-gray-700' },
  green: { bg: 'bg-green-100', border: 'border-l-green-400', text: 'text-gray-700' },
  pink: { bg: 'bg-pink-100', border: 'border-l-pink-400', text: 'text-gray-700' },
  purple: { bg: 'bg-purple-100', border: 'border-l-purple-400', text: 'text-gray-700' },
  orange: { bg: 'bg-orange-100', border: 'border-l-orange-400', text: 'text-gray-700' }
};

const STORAGE_KEY = 'medicalAppStickyNotes';

export function QuickNotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        })));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    } else {
      // Default Notes matching the design
      setNotes([
        {
          id: 'note-1',
          content: '',
          color: 'yellow',
          isPinned: false,
          position: { x: 100, y: 100 },
          size: { width: 280, height: 200 },
          createdAt: new Date()
        },
        {
          id: 'note-2',
          content: '',
          color: 'purple',
          isPinned: false,
          position: { x: 500, y: 100 },
          size: { width: 280, height: 200 },
          createdAt: new Date()
        }
      ]);
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: '',
      color: 'yellow', // Default color, user can change it
      isPinned: false,
      position: {
        x: 50 + (notes.length * 30) % 300,
        y: 100 + (notes.length * 30) % 200
      },
      size: { width: 280, height: 200 },
      createdAt: new Date()
    };

    setNotes([...notes, newNote]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const handleChangeColor = (id: string, color: NoteColor) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, color } : note
    ));
    setShowColorPicker(null);
  };

  const handleClearAll = () => {
    if (notes.length === 0) return;
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    setNotes([]);
    setEditingNoteId(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowClearConfirm(false);
  };

  const handleDoubleClick = (id: string) => {
    setEditingNoteId(id);
  };

  const handleContentChange = (id: string, content: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  };

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, position: { x, y } } : note
    ));
  };

  const handleUpdateSize = (id: string, width: number, height: number) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, size: { width, height } } : note
    ));
  };

  const bringToFront = (id: string) => {
    // Simple way to bring to front: remove and re-add to end of array
    // But we need to maintain state.
    // Alternatively, we can just sort by a zIndex property, but re-ordering array works for visual stacking in DOM.
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1 || noteIndex === notes.length - 1) return;

    const note = notes[noteIndex];
    const newNotes = [...notes];
    newNotes.splice(noteIndex, 1);
    newNotes.push(note);
    setNotes(newNotes);
  };


  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sticky Notes Board</h2>
          <p className="text-sm text-gray-500 mt-1">Drag to move, resize corners, double-click to edit</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">{notes.length} notes</span>
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={notes.length === 0}
            className="text-gray-700 hover:bg-gray-50 border-gray-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={handleCreateNote}
            className="bg-[#F97316] hover:bg-[#ea6b0f] text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes Board */}
      <div
        className="relative w-full bg-gray-50"
        style={{ height: 'calc(100vh - 180px)', minHeight: '600px' }}
        onClick={() => {
          setEditingNoteId(null);
          setShowColorPicker(null);
        }}
      >
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 pointer-events-none select-none">
            <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-lg shadow-md p-8 w-80 mb-6 flex flex-col items-center">
              <p className="text-gray-700 text-center font-medium">
                Click "New Note" to create your first sticky note!
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              You can drag notes around and resize them
            </p>
          </div>
        )}

        {notes.map((note) => {
          const colors = noteColors[note.color];
          const isEditing = editingNoteId === note.id;

          return (
            <Rnd
              key={note.id}
              position={note.position}
              size={note.size}
              onDragStart={() => bringToFront(note.id)}
              onDragStop={(e, d) => {
                handleUpdatePosition(note.id, d.x, d.y);
              }}
              onResizeStart={() => bringToFront(note.id)}
              onResizeStop={(e, direction, ref, delta, position) => {
                handleUpdateSize(
                  note.id,
                  parseInt(ref.style.width),
                  parseInt(ref.style.height)
                );
                handleUpdatePosition(note.id, position.x, position.y);
              }}
              minWidth={200}
              minHeight={150}
              bounds="parent"
              enableResizing={!note.isPinned}
              disableDragging={note.isPinned || isEditing}
              className={`${note.isPinned ? 'cursor-default' : 'cursor-move'}`}
              dragHandleClassName="note-drag-handle"
            >
              <div
                className={`h-full w-full ${colors.bg} ${colors.border} border-l-[6px] rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col relative group overflow-hidden note-drag-handle`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(note.id);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top controls (Visible on Hover) - Clean looking */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 no-drag">
                  {/* Pin button */}
                  <div
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                    className={`p-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer ${note.isPinned ? 'text-[#F97316] bg-white/50' : 'text-gray-500'
                      }`}
                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                  </div>

                  {/* Color picker button */}
                  <div className="relative">
                    <div
                      onClick={(e) => { e.stopPropagation(); setShowColorPicker(showColorPicker === note.id ? null : note.id); }}
                      className="p-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer text-gray-500"
                      title="Change color"
                    >
                      <Palette className="w-4 h-4" />
                    </div>

                    {/* Color picker dropdown */}
                    {showColorPicker === note.id && (
                      <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 p-2 flex flex-nowrap gap-1.5 z-30 min-w-max animate-in fade-in zoom-in-95 duration-200">
                        {(Object.keys(noteColors) as NoteColor[]).map((color) => (
                          <div
                            key={color}
                            onClick={(e) => { e.stopPropagation(); handleChangeColor(note.id, color); }}
                            className={`w-6 h-6 rounded-md ${noteColors[color].bg} border ${note.color === color ? 'border-[#F97316] ring-1 ring-[#F97316]' : 'border-gray-300'
                              } hover:scale-110 transition-transform cursor-pointer shadow-sm`}
                            title={color}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <div
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    className="p-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer text-red-400 hover:text-red-600"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Note content */}
                <div className="flex-1 p-6 overflow-hidden">
                  {isEditing ? (
                    <Textarea
                      value={note.content}
                      onChange={(e) => handleContentChange(note.id, e.target.value)}
                      onBlur={() => setEditingNoteId(null)}
                      placeholder="Type your note here..."
                      className={`w-full h-full bg-transparent border-none focus:ring-0 resize-none p-0 text-base leading-relaxed ${colors.text} font-medium placeholder-gray-400/70`}
                      style={{ boxShadow: 'none' }}
                      autoFocus
                    />
                  ) : (
                    <div className={`w-full h-full ${colors.text} text-base font-medium leading-relaxed whitespace-pre-wrap break-words overflow-y-auto`}>
                      {note.content || (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-gray-400/80 italic text-sm">Double-click to edit</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Rnd>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between z-10 sticky bottom-0">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-[#F97316]">●</span>
          <span>© 2026 Ataraxia Health. All rights reserved.</span>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <HelpCircle className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
            style={{ maxWidth: '320px' }}
          >
            <div className="p-5 text-center">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Clear all notes?</h3>
              <p className="text-gray-500 mb-5 text-sm">
                This will permanently delete all {notes.length} sticky notes.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 border-gray-300 hover:bg-gray-50 h-9 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={confirmClearAll}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent h-9 text-sm"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
