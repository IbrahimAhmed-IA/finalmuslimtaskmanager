'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Note } from '@/lib/types';
import { FaTrash, FaEllipsisH, FaTag, FaStar, FaRegStar, FaEdit, FaFolder } from 'react-icons/fa';
import { useAppSettings } from '@/context/app-settings-context';

interface NoteCategory {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
}

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  isAdvancedMode?: boolean;
  hideSection?: boolean; // Option to hide section display
  favoriteNotes?: string[]; // IDs of favorite notes
  onToggleFavorite?: (id: string) => void; // Function to toggle favorite status
  categories?: NoteCategory[]; // Categories list
}

export default function NotesList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  hideSection = false,
  favoriteNotes = [],
  onToggleFavorite,
  categories = [],
}: NotesListProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { settings } = useAppSettings();
  const isAdvancedMode = settings.advancedMode;

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const noteDate = new Date(date);

    if (noteDate.toDateString() === now.toDateString()) {
      return `Today at ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (noteDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return noteDate.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleMenu = (noteId: string) => {
    if (activeMenu === noteId) {
      setActiveMenu(null);
    } else {
      setActiveMenu(noteId);
    }
  };

  // Get category by ID
  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  // Sort notes by most recently updated
  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (sortedNotes.length === 0) {
    return (
      <div className={`p-4 text-center ${isAdvancedMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No notes found
      </div>
    );
  }

  return (
    <div className="notes-list space-y-2 py-1">
      {sortedNotes.map((note) => {
        const noteCategory = note.categoryId ? getCategoryById(note.categoryId) : null;

        return (
          <div
            key={note.id}
            className={`relative p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
              selectedNoteId === note.id
                ? isAdvancedMode
                  ? 'bg-slate-700/50 text-white border-slate-600/70 shadow-md'
                  : 'bg-indigo-50/80 border-indigo-200 shadow-sm'
                : isAdvancedMode
                  ? 'hover:bg-slate-800/50 text-gray-300 border-slate-700/30 hover:border-slate-600/50'
                  : 'hover:bg-gray-50 text-gray-800 border-gray-100 hover:border-gray-200 hover:shadow-sm'
            } note-list-item`}
            onClick={() => onSelectNote(note.id)}
            style={{
              borderLeft: noteCategory
                ? `3px solid ${noteCategory.color}`
                : undefined
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className={`font-medium truncate flex-1 ${
                    selectedNoteId === note.id
                      ? isAdvancedMode ? 'text-white' : 'text-gray-900'
                      : isAdvancedMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {note.title}
                  </h3>

                  {/* Favorite star icon */}
                  {onToggleFavorite && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(note.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-5 w-5 ${
                        favoriteNotes.includes(note.id)
                          ? isAdvancedMode ? 'text-amber-400' : 'text-amber-500'
                          : isAdvancedMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {favoriteNotes.includes(note.id)
                        ? <FaStar size={13} />
                        : <FaRegStar size={13} />}
                    </Button>
                  )}
                </div>

                <div className="flex items-center mt-1.5 flex-wrap gap-1.5">
                  <span className={`text-xs ${isAdvancedMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatDate(note.updatedAt)}
                  </span>

                  {/* Show category if note has one */}
                  {noteCategory && (
                    <span className="inline-flex items-center">
                      <span
                        className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          backgroundColor: `${noteCategory.color}15`,
                          color: noteCategory.color,
                          borderWidth: 1,
                          borderColor: `${noteCategory.color}30`,
                        }}
                      >
                        <span className="mr-1">{noteCategory.emoji}</span> {noteCategory.name}
                      </span>
                    </span>
                  )}

                  {/* Show section tag if note has a section and hideSection is false */}
                  {note.section && !hideSection && (
                    <span className="inline-flex items-center">
                      <span className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        isAdvancedMode
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        <FaTag className="mr-1" size={8} /> {note.section}
                      </span>
                    </span>
                  )}
                </div>

                <p className={`text-xs mt-2 truncate leading-relaxed ${
                  isAdvancedMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {note.content.substring(0, 120).replace(/\n/g, ' ')}
                </p>
              </div>

              <div className="ml-2 relative">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(note.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 rounded-full ${
                    isAdvancedMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <FaEllipsisH size={12} />
                </Button>

                {activeMenu === note.id && (
                  <div
                    className={`absolute right-0 top-8 min-w-[160px] z-50 rounded-lg shadow-xl ${
                      isAdvancedMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="py-1.5" role="menu">
                      {/* Favorite toggle option */}
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(note.id);
                            setActiveMenu(null);
                          }}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                            isAdvancedMode
                              ? 'text-gray-300 hover:bg-slate-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          role="menuitem"
                        >
                          {favoriteNotes.includes(note.id)
                            ? <><FaStar className="mr-2 text-amber-500" size={12} /> Remove from favorites</>
                            : <><FaRegStar className="mr-2 text-amber-500" size={12} /> Add to favorites</>
                          }
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNote(note.id); // This will select the note for editing
                          setActiveMenu(null);
                        }}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                          isAdvancedMode
                            ? 'text-gray-300 hover:bg-slate-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        role="menuitem"
                      >
                        <FaEdit className="mr-2 text-blue-500" size={12} />
                        Edit note
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                          setActiveMenu(null);
                        }}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                          isAdvancedMode
                            ? 'text-gray-300 hover:bg-slate-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        role="menuitem"
                      >
                        <FaTrash className="mr-2 text-red-500" size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
