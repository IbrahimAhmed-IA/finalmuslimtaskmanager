'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FaSave,
  FaTimes,
  FaBold,
  FaItalic,
  FaListUl,
  FaHeading,
  FaLink,
  FaImage,
  FaQuoteRight,
  FaTag,
  FaCode,
  FaListOl,
  FaCheckSquare,
  FaUnderline,
  FaStrikethrough,
  FaFolder
} from 'react-icons/fa';
import { Select } from '@/components/ui/select';
import { useNoteContext } from '@/context/note-context';

interface NoteCategory {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
}

interface NoteEditorProps {
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialContent?: string;
  initialSection?: string;
  initialCategoryId?: string;
  onSave: (title: string, content: string, section?: string, categoryId?: string) => void;
  onCancel: () => void;
  isAdvancedMode: boolean;
  notionLike?: boolean;
  categories: NoteCategory[];
}

export default function NoteEditor({
  mode,
  initialTitle = '',
  initialContent = '',
  initialSection = '',
  initialCategoryId = '',
  onSave,
  onCancel,
  isAdvancedMode,
  notionLike = false,
  categories
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle || 'Untitled');
  const [content, setContent] = useState(initialContent);
  const [section, setSection] = useState(initialSection || '');
  const [categoryId, setCategoryId] = useState(initialCategoryId || '');
  const [charCount, setCharCount] = useState(initialContent.length);
  const [wordCount, setWordCount] = useState(initialContent.trim() ? initialContent.trim().split(/\s+/).length : 0);
  const [newSection, setNewSection] = useState('');
  const [isAddingNewSection, setIsAddingNewSection] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { getAvailableSections } = useNoteContext();

  const availableSections = getAvailableSections();

  // Focus the title field when creating a new note
  useEffect(() => {
    if (mode === 'create' && titleRef.current) {
      titleRef.current.focus();
    }
  }, [mode]);

  // Update state when initialTitle/initialContent change (when editing different notes)
  useEffect(() => {
    setTitle(initialTitle || 'Untitled');
    setContent(initialContent);
    setSection(initialSection || '');
    setCategoryId(initialCategoryId || '');
    setCharCount(initialContent.length);
    setWordCount(initialContent.trim() ? initialContent.trim().split(/\s+/).length : 0);
    setHasUnsavedChanges(false);
  }, [initialTitle, initialContent, initialSection, initialCategoryId]);

  // Update word and character counts when content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);
    setWordCount(newContent.trim() ? newContent.trim().split(/\s+/).length : 0);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textareaRef.current?.focus();
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim() || 'Untitled';
    const sectionToUse = isAddingNewSection && newSection.trim() ? newSection.trim() : section;
    onSave(trimmedTitle, content, sectionToUse, categoryId);
    setHasUnsavedChanges(false);
    setLastSavedAt(new Date());
  };

  // Auto-save feature (every 30 seconds if changes exist)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [content, title, section, categoryId, hasUnsavedChanges]);

  // Format current time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Insert formatting at cursor position
  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newContent = beforeText + prefix + selectedText + suffix + afterText;
    setContent(newContent);
    setHasUnsavedChanges(true);

    // Set new cursor position and focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 10);
  };

  const notionStyleClasses = notionLike
    ? `px-0 border-none shadow-none ${isAdvancedMode ? 'bg-slate-900' : 'bg-white'}`
    : '';

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setIsAddingNewSection(true);
    } else {
      setSection(value);
      setIsAddingNewSection(false);
    }
    setHasUnsavedChanges(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
    setHasUnsavedChanges(true);
  };

  const cancelNewSection = () => {
    setIsAddingNewSection(false);
    setNewSection('');
    setSection('');
  };

  // Insert a list item
  const insertListItem = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = content.substring(0, start).split('\n');
    const currentLineStart = content.lastIndexOf('\n', start - 1) + 1;
    const beforeText = content.substring(0, currentLineStart);
    const middleText = prefix;
    const afterText = content.substring(currentLineStart);

    setContent(beforeText + middleText + afterText);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        currentLineStart + middleText.length,
        currentLineStart + middleText.length
      );
    }, 10);
  };

  // Insert an image
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      insertFormatting(`![image](${url})`);
    }
  };

  // Insert a link
  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      insertFormatting('[', `](${url})`);
    }
  };

  // Count estimated reading time
  const estimatedReadingTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes < 1 ? '< 1 min read' : `${minutes} min read`;
  };

  // Get category by ID
  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  // Current category
  const currentCategory = categoryId ? getCategoryById(categoryId) : null;

  return (
    <div className={`note-editor ${notionLike ? 'notion-editor p-6' : 'space-y-4'}`}>
      {!notionLike && (
        <h2 className={`text-xl font-semibold ${isAdvancedMode ? 'text-white' : 'text-gray-800'}`}>
          {mode === 'create' ? 'Create Note' : 'Edit Note'}
        </h2>
      )}

      <div className={`${notionLike ? '' : 'space-y-4'}`}>
        {/* Title input with Notion-like styling */}
        <div className={notionLike ? 'mb-4' : ''}>
          <Input
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            className={`text-xl font-bold mb-4 ${
              isAdvancedMode
                ? 'bg-slate-900 border-slate-800 text-white placeholder:text-gray-500'
                : 'bg-white placeholder:text-gray-400'
            } ${notionStyleClasses}`}
            style={notionLike ? { fontSize: '1.875rem', padding: '0.5rem 0' } : {}}
          />
        </div>

        {/* Category selector */}
        <div className={`mb-4 ${isAdvancedMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center mb-2">
            <FaFolder className={`mr-2 ${isAdvancedMode ? 'text-blue-400' : 'text-indigo-500'}`} size={14} />
            <span className="text-sm font-medium">Category:</span>
          </div>

          <div className="flex">
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className={`w-full px-3 py-2 text-sm rounded-md ${
                isAdvancedMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
              style={{
                borderLeft: currentCategory
                  ? `3px solid ${currentCategory.color}`
                  : isAdvancedMode
                    ? '3px solid transparent'
                    : '3px solid transparent'
              }}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  style={{ color: category.color }}
                >
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
          </div>

          {currentCategory && (
            <div className="mt-2 flex items-center">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${currentCategory.color}20`,
                  color: currentCategory.color,
                  borderWidth: 1,
                  borderColor: `${currentCategory.color}40`,
                }}
              >
                {currentCategory.emoji} {currentCategory.name}
              </span>
            </div>
          )}
        </div>

        {/* Section/tag selector with enhanced styling */}
        <div className={`mb-4 flex items-center ${isAdvancedMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center mr-2">
            <FaTag className={`mr-2 ${isAdvancedMode ? 'text-blue-400' : 'text-indigo-500'}`} size={14} />
            <span className="text-sm">Tag:</span>
          </div>

          {isAddingNewSection ? (
            <div className="flex items-center flex-1">
              <Input
                value={newSection}
                onChange={(e) => {
                  setNewSection(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Enter new tag name"
                className={`text-sm mr-2 ${
                  isAdvancedMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-200'
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelNewSection}
                className={isAdvancedMode ? 'text-slate-300 hover:text-white' : ''}
              >
                <FaTimes size={12} />
              </Button>
            </div>
          ) : (
            <select
              value={section}
              onChange={handleSectionChange}
              className={`ml-2 px-2 py-1 text-sm rounded-md ${
                isAdvancedMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <option value="">No tag</option>
              {availableSections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="new">+ Add new tag</option>
            </select>
          )}

          {section && !isAddingNewSection && (
            <span className="ml-2">
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isAdvancedMode
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {section}
              </span>
            </span>
          )}
        </div>

        {/* Enhanced formatting toolbar with more options */}
        <div className={`flex flex-wrap items-center space-x-1 rounded-t-md ${
          notionLike
            ? `py-2 mb-3 border-b ${isAdvancedMode ? 'border-slate-800' : 'border-gray-200'}`
            : `p-1 border-b ${isAdvancedMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'}`
        }`}>
          <div className="flex space-x-1 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('**', '**')}
              title="Bold (Ctrl+B)"
            >
              <FaBold size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('*', '*')}
              title="Italic (Ctrl+I)"
            >
              <FaItalic size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('__', '__')}
              title="Underline"
            >
              <FaUnderline size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('~~', '~~')}
              title="Strikethrough"
            >
              <FaStrikethrough size={14} />
            </Button>
          </div>

          <div className={`h-4 w-px mx-1 ${isAdvancedMode ? 'bg-slate-500' : 'bg-gray-300'}`} />

          <div className="flex space-x-1 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('# ')}
              title="Heading 1"
            >
              <FaHeading size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('## ')}
              title="Heading 2"
            >
              <span className="text-xs font-semibold">H2</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('### ')}
              title="Heading 3"
            >
              <span className="text-xs font-semibold">H3</span>
            </Button>
          </div>

          <div className={`h-4 w-px mx-1 ${isAdvancedMode ? 'bg-slate-500' : 'bg-gray-300'}`} />

          <div className="flex space-x-1 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertListItem('- ')}
              title="Bulleted List"
            >
              <FaListUl size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertListItem('1. ')}
              title="Numbered List"
            >
              <FaListOl size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertListItem('- [ ] ')}
              title="Task List"
            >
              <FaCheckSquare size={14} />
            </Button>
          </div>

          <div className={`h-4 w-px mx-1 ${isAdvancedMode ? 'bg-slate-500' : 'bg-gray-300'}`} />

          <div className="flex space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertListItem('> ')}
              title="Quote"
            >
              <FaQuoteRight size={12} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={() => insertFormatting('`', '`')}
              title="Inline Code"
            >
              <FaCode size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={insertImage}
              title="Insert Image"
            >
              <FaImage size={14} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isAdvancedMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              onClick={insertLink}
              title="Insert Link"
            >
              <FaLink size={14} />
            </Button>
          </div>
        </div>

        {/* Main content textarea with improved styling */}
        <div>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={notionLike
              ? "Start writing your note..."
              : "Write your note here..."}
            className={`min-h-[300px] resize-y ${
              isAdvancedMode
                ? 'bg-slate-900 border-slate-700 text-white placeholder:text-gray-500'
                : 'focus:border-indigo-300 focus:ring-indigo-300'
            } ${notionStyleClasses}`}
            style={notionLike ? {
              minHeight: '65vh',
              fontSize: '1.05rem',
              lineHeight: '1.6'
            } : {}}
          />

          {/* Enhanced information bar with stats */}
          <div className={`mt-2 text-xs flex justify-between items-center ${
            isAdvancedMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="flex space-x-3">
              <span>{charCount} characters</span>
              <span>{wordCount} words</span>
              <span>{estimatedReadingTime()}</span>
            </div>

            {lastSavedAt && (
              <span className="text-xs italic">
                Last saved at {formatTime(lastSavedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons - only shown when not in Notion-like mode */}
        {!notionLike && (
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant={isAdvancedMode ? "outline" : "outline"}
              onClick={onCancel}
              className={isAdvancedMode ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : ''}
            >
              <FaTimes className="mr-1.5" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={isAdvancedMode ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              <FaSave className="mr-1.5" /> {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        )}

        {/* Fixed action buttons for Notion-like mode */}
        {notionLike && (
          <div className={`fixed bottom-6 right-6 flex gap-2 shadow-lg rounded-lg p-2 ${
            isAdvancedMode ? 'bg-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <Button
              variant={isAdvancedMode ? "outline" : "outline"}
              onClick={onCancel}
              size="sm"
              className={isAdvancedMode ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : ''}
            >
              <FaTimes className="mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className={isAdvancedMode ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              <FaSave className="mr-1" /> {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
