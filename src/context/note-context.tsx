'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Note } from '@/lib/types';
import { getNotes, saveNotes } from '@/lib/storage';
import { toast } from 'sonner';

interface NoteCategory {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
}

interface NoteContextType {
  notes: Note[];
  categories: NoteCategory[];
  addNote: (title: string, content: string, section?: string, categoryId?: string) => string; // Return the ID of the new note
  updateNote: (id: string, title: string, content: string, section?: string, categoryId?: string) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  getAvailableSections: () => string[];
  addCategory: (name: string, color?: string, emoji?: string) => string;
  updateCategory: (id: string, name: string, color?: string, emoji?: string) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => NoteCategory | undefined;
}

// Initialize with some default categories
const DEFAULT_CATEGORIES: NoteCategory[] = [
  { id: 'personal', name: 'Personal', color: '#4f46e5', emoji: '👤' },
  { id: 'work', name: 'Work', color: '#0891b2', emoji: '💼' },
  { id: 'study', name: 'Study', color: '#0d9488', emoji: '📚' },
  { id: 'ideas', name: 'Ideas', color: '#f59e0b', emoji: '💡' },
];

const NoteContext = createContext<NoteContextType | null>(null);

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>(() => {
    // Try to load categories from localStorage
    if (typeof window !== 'undefined') {
      const savedCategories = localStorage.getItem('biome-note-categories');
      if (savedCategories) {
        try {
          return JSON.parse(savedCategories);
        } catch (error) {
          console.error('Failed to parse saved categories', error);
        }
      }
    }
    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    // Load notes from localStorage on initial render
    const savedNotes = getNotes();
    setNotes(savedNotes);
  }, []);

  useEffect(() => {
    // Save notes to localStorage whenever they change
    saveNotes(notes);
  }, [notes]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('biome-note-categories', JSON.stringify(categories));
    }
  }, [categories]);

  const addNote = (title: string, content: string, section?: string, categoryId?: string) => {
    if (!title.trim()) {
      toast.error('Note title cannot be empty');
      return '';
    }

    const now = new Date();
    const newNoteId = Date.now().toString();
    const newNote: Note = {
      id: newNoteId,
      title: title.trim(),
      content,
      createdAt: now,
      updatedAt: now,
      section: section && section.trim() ? section.trim() : undefined,
      categoryId: categoryId,
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    toast.success('Note added successfully');

    return newNoteId;
  };

  const updateNote = (id: string, title: string, content: string, section?: string, categoryId?: string) => {
    if (!title.trim()) {
      toast.error('Note title cannot be empty');
      return;
    }

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content,
              section: section && section.trim() ? section.trim() : undefined,
              categoryId: categoryId,
              updatedAt: new Date(),
            }
          : note
      )
    );
    toast.success('Note updated');
  };

  const deleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    toast.success('Note deleted');
  };

  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id);
  };

  const getAvailableSections = () => {
    const sections = notes
      .map((note) => note.section)
      .filter((section): section is string => !!section);
    return [...new Set(sections)].sort();
  };

  // Category management functions
  const addCategory = (name: string, color?: string, emoji?: string) => {
    if (!name.trim()) {
      toast.error('Category name cannot be empty');
      return '';
    }

    const newCategoryId = `category-${Date.now()}`;
    const newCategory: NoteCategory = {
      id: newCategoryId,
      name: name.trim(),
      color: color || '#64748b', // Default color
      emoji: emoji,
    };

    setCategories((prev) => [...prev, newCategory]);
    toast.success('Category added');
    return newCategoryId;
  };

  const updateCategory = (id: string, name: string, color?: string, emoji?: string) => {
    if (!name.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              name: name.trim(),
              color: color || category.color,
              emoji: emoji || category.emoji,
            }
          : category
      )
    );
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    // Remove category from all notes first
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.categoryId === id ? { ...note, categoryId: undefined } : note
      )
    );

    // Then delete the category
    setCategories((prev) => prev.filter((category) => category.id !== id));
    toast.success('Category deleted');
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        categories,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        getAvailableSections,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
