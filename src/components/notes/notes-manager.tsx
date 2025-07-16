import { useNoteContext } from "@/context/note-context";
import { useState, useEffect } from "react";
import NoteEditor from "./note-editor";
import NotesList from "./notes-list";
import { FaPlus, FaStickyNote, FaChevronLeft, FaFolder, FaTag, FaStar, FaSearch, FaPalette, FaSmile } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/context/app-settings-context";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NotesManager() {
  const { notes, categories, addNote, updateNote, deleteNote, getAvailableSections, addCategory } = useNoteContext();
  const { settings } = useAppSettings();
  const isAdvancedMode = settings.advancedMode;

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [favoriteNotes, setFavoriteNotes] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#4f46e5");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("📁");

  // Get all available sections
  const availableSections = getAvailableSections();

  // Filter notes based on search query, active section, category, and favorites
  useEffect(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Apply section filter if a section is active
    if (activeSection !== null) {
      filtered = filtered.filter(note => note.section === activeSection);
    }

    // Apply category filter if a category is active
    if (activeCategory !== null) {
      filtered = filtered.filter(note => note.categoryId === activeCategory);
    }

    // Apply favorites filter if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter(note => favoriteNotes.includes(note.id));
    }

    setFilteredNotes(filtered);
  }, [searchQuery, notes, activeSection, activeCategory, favoriteNotes, showFavoritesOnly]);

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsCreatingNote(false);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(true);
  };

  const handleSaveNote = (title: string, content: string, section?: string, categoryId?: string) => {
    const finalCategoryId = categoryId || activeCategory || undefined;

    if (isCreatingNote) {
      // Use the active section if creating a note while a section is selected
      const finalSection = section || activeSection || undefined;
      addNote(title, content, finalSection, finalCategoryId);
      setIsCreatingNote(false);
    } else if (selectedNoteId) {
      updateNote(selectedNoteId, title, content, section, finalCategoryId);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }

    // Remove from favorites if present
    if (favoriteNotes.includes(noteId)) {
      setFavoriteNotes(favoriteNotes.filter(id => id !== noteId));
    }
  };

  const handleCancel = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(false);
  };

  // Toggle favorite status for a note
  const toggleFavorite = (noteId: string) => {
    if (favoriteNotes.includes(noteId)) {
      setFavoriteNotes(favoriteNotes.filter(id => id !== noteId));
    } else {
      setFavoriteNotes([...favoriteNotes, noteId]);
    }
  };

  // Toggle favorites filter
  const toggleFavoritesFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setActiveSection(null);
    setActiveCategory(null);
  };

  // Handle section click to filter notes
  const handleSectionClick = (section: string) => {
    // If clicking the already active section, clear the filter
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      setShowFavoritesOnly(false);
      setActiveCategory(null);
    }
  };

  // Handle category click to filter notes
  const handleCategoryClick = (categoryId: string) => {
    // If clicking the already active category, clear the filter
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryId);
      setShowFavoritesOnly(false);
      setActiveSection(null);
    }
  };

  // Handle adding a new section
  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      toast.error("Section name cannot be empty");
      return;
    }

    // Create a new note in this section
    setIsCreatingNote(true);
    setActiveSection(newSectionName.trim());
    setActiveCategory(null);
    setShowAddSection(false);
    setNewSectionName("");
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const categoryId = addCategory(newCategoryName.trim(), newCategoryColor, newCategoryEmoji);
    setActiveCategory(categoryId);
    setActiveSection(null);
    setShowFavoritesOnly(false);
    setShowAddCategory(false);
    setNewCategoryName("");
    // Don't reset color and emoji to make it easier to add multiple categories with the same theme
  };

  // UI helpers
  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const getNotesCountByCategory = (categoryId: string) => {
    return notes.filter(note => note.categoryId === categoryId).length;
  };

  return (
    <div className={`p-0 rounded-xl h-[calc(100vh-65px)] w-full ${
      isAdvancedMode ? "bg-slate-800/50" : "bg-white shadow-sm border border-gray-100"
    }`}>
      <div className="flex h-full w-full">
        {/* Sidebar for categories */}
        <div className={`w-64 border-r p-4 overflow-y-auto ${
          isAdvancedMode ? "bg-slate-800/80 border-slate-700/50" : "bg-gray-50 border-gray-200"
        }`}>
          <div className="mb-4">
            <h2 className={`text-lg font-semibold ${
              isAdvancedMode ? "text-white" : "text-gray-800"
            }`}>
              Notes
            </h2>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={`${isAdvancedMode ? "text-gray-400" : "text-gray-500"}`} size={12} />
            </div>
            <Input
              type="text"
              placeholder="Search notes..."
              className={`pl-9 py-1.5 text-sm ${
                isAdvancedMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  : "bg-white border-gray-200"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Create note button */}
          <Button
            onClick={handleCreateNote}
            className={`w-full mb-6 ${
              isAdvancedMode
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <FaPlus className="mr-2" size={12} /> New Note
          </Button>

          {/* All Notes */}
          <div className="mb-2">
            <button
              onClick={() => {
                setActiveSection(null);
                setActiveCategory(null);
                setShowFavoritesOnly(false);
              }}
              className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                !activeSection && !activeCategory && !showFavoritesOnly
                  ? isAdvancedMode
                    ? "bg-slate-700/60 text-white"
                    : "bg-indigo-50 text-indigo-700 font-medium"
                  : isAdvancedMode
                    ? "text-gray-300 hover:bg-slate-700/40"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaStickyNote className="mr-2" size={14} />
              All Notes
              <span className={`ml-auto ${
                isAdvancedMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-700"
              } px-2 py-0.5 rounded-full text-xs`}>
                {notes.length}
              </span>
            </button>
          </div>

          {/* Favorites */}
          <div className="mb-2">
            <button
              onClick={toggleFavoritesFilter}
              className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                showFavoritesOnly
                  ? isAdvancedMode
                    ? "bg-amber-900/30 text-amber-300 font-medium"
                    : "bg-amber-50 text-amber-700 font-medium"
                  : isAdvancedMode
                    ? "text-gray-300 hover:bg-slate-700/40"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaStar className={`mr-2 ${
                showFavoritesOnly
                  ? isAdvancedMode ? "text-amber-400" : "text-amber-500"
                  : isAdvancedMode ? "text-gray-400" : "text-gray-500"
              }`} size={14} />
              Favorites
              <span className={`ml-auto ${
                isAdvancedMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-700"
              } px-2 py-0.5 rounded-full text-xs`}>
                {notes.filter(note => favoriteNotes.includes(note.id)).length}
              </span>
            </button>
          </div>

          {/* Categories header */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                isAdvancedMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Categories
              </h3>
              <button
                onClick={() => {
                  setShowAddCategory(!showAddCategory);
                  setShowAddSection(false);
                }}
                className={`text-xs ${
                  isAdvancedMode ? "text-blue-400 hover:text-blue-300" : "text-indigo-600 hover:text-indigo-500"
                }`}
              >
                {showAddCategory ? "Cancel" : "+ Add"}
              </button>
            </div>
          </div>

          {/* Add Category Input */}
          {showAddCategory && (
            <div className="mb-4 space-y-2">
              <Input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className={`text-sm ${
                  isAdvancedMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-200"
                }`}
              />

              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={newCategoryEmoji}
                    onChange={e => setNewCategoryEmoji(e.target.value)}
                    placeholder="Emoji"
                    className={`text-sm pl-8 ${
                      isAdvancedMode
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaSmile size={14} className={isAdvancedMode ? "text-gray-400" : "text-gray-500"} />
                  </div>
                </div>

                <div className="relative flex-1">
                  <Input
                    type="color"
                    value={newCategoryColor}
                    onChange={e => setNewCategoryColor(e.target.value)}
                    className="w-full h-9 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddCategory}
                className={`w-full ${
                  isAdvancedMode ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 text-white"
                }`}
              >
                <FaPlus size={10} className="mr-2" /> Add Category
              </Button>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-1 mb-4 max-h-[180px] overflow-auto pr-1 custom-scrollbar">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  activeCategory === category.id
                    ? isAdvancedMode
                      ? "bg-slate-700/70 text-white font-medium shadow-md"
                      : "bg-gray-100 text-gray-800 font-medium"
                    : isAdvancedMode
                      ? "text-gray-300 hover:bg-slate-700/40"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
                style={{
                  borderLeft: activeCategory === category.id
                    ? `3px solid ${category.color}`
                    : isAdvancedMode
                      ? '3px solid transparent'
                      : '3px solid transparent'
                }}
              >
                <span className="mr-2">{category.emoji}</span>
                <span style={{ color: activeCategory === category.id ? category.color : 'inherit' }}>
                  {category.name}
                </span>
                <span className={`ml-auto ${
                  isAdvancedMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-700"
                } px-2 py-0.5 rounded-full text-xs`}>
                  {getNotesCountByCategory(category.id)}
                </span>
              </button>
            ))}
          </div>

          {/* Sections header */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                isAdvancedMode ? "text-gray-400" : "text-gray-500"
              }`}>
                Tags
              </h3>
              <button
                onClick={() => {
                  setShowAddSection(!showAddSection);
                  setShowAddCategory(false);
                }}
                className={`text-xs ${
                  isAdvancedMode ? "text-blue-400 hover:text-blue-300" : "text-indigo-600 hover:text-indigo-500"
                }`}
              >
                {showAddSection ? "Cancel" : "+ Add"}
              </button>
            </div>
          </div>

          {/* Add Section Input */}
          {showAddSection && (
            <div className="mb-3 flex">
              <Input
                type="text"
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                placeholder="New tag name"
                className={`text-sm ${
                  isAdvancedMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-200"
                }`}
              />
              <Button
                onClick={handleAddSection}
                size="sm"
                className={`ml-1 ${
                  isAdvancedMode ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 text-white"
                }`}
              >
                <FaPlus size={10} />
              </Button>
            </div>
          )}

          {/* Sections/Tags List */}
          <div className="space-y-1 max-h-[calc(100vh-500px)] overflow-auto pr-1 custom-scrollbar">
            {availableSections.map(section => (
              <button
                key={section}
                onClick={() => handleSectionClick(section)}
                className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  activeSection === section
                    ? isAdvancedMode
                      ? "bg-blue-900/30 text-blue-300 font-medium"
                      : "bg-blue-50 text-blue-700 font-medium"
                    : isAdvancedMode
                      ? "text-gray-300 hover:bg-slate-700/40"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaTag className={`mr-2 ${
                  activeSection === section
                    ? isAdvancedMode ? "text-blue-400" : "text-blue-500"
                    : isAdvancedMode ? "text-gray-400" : "text-gray-500"
                }`} size={14} />
                {section}
                <span className={`ml-auto ${
                  isAdvancedMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-700"
                } px-2 py-0.5 rounded-full text-xs`}>
                  {notes.filter(note => note.section === section).length}
                </span>
              </button>
            ))}

            {availableSections.length === 0 && (
              <div className={`text-center py-4 text-sm ${
                isAdvancedMode ? "text-gray-400" : "text-gray-500"
              }`}>
                No tags created yet
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 h-full overflow-hidden w-full">
          {/* Content Header - Shows current context */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className={`text-lg font-semibold ${
                isAdvancedMode ? "text-white" : "text-gray-800"
              }`}>
                {showFavoritesOnly
                  ? "Favorite Notes"
                  : activeCategory
                    ? `Category: ${getCategoryById(activeCategory)?.name || 'Unknown'}`
                    : activeSection
                      ? `Tag: ${activeSection}`
                      : searchQuery
                        ? "Search Results"
                        : "All Notes"}
              </h2>
              {searchQuery && (
                <p className={`text-xs ${isAdvancedMode ? "text-gray-400" : "text-gray-500"}`}>
                  Showing results for "{searchQuery}"
                </p>
              )}
              {activeCategory && (
                <p className={`text-xs flex items-center mt-1 ${isAdvancedMode ? "text-gray-400" : "text-gray-500"}`}>
                  <span className="mr-1" style={{ color: getCategoryById(activeCategory)?.color }}>
                    {getCategoryById(activeCategory)?.emoji}
                  </span>
                  <span style={{ color: getCategoryById(activeCategory)?.color }}>
                    {getNotesCountByCategory(activeCategory)} notes
                  </span>
                </p>
              )}
            </div>

            {!isCreatingNote && !selectedNote && (
              <Button
                onClick={handleCreateNote}
                className={`${
                  isAdvancedMode
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                <FaPlus className="mr-2" size={12} /> New Note
              </Button>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {isCreatingNote || selectedNote ? (
              <div>
                <div className="mb-4">
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="sm"
                    className={`px-2 -ml-2 ${
                      isAdvancedMode
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaChevronLeft className="mr-1.5" size={12} /> Back to notes
                  </Button>
                </div>

                {isCreatingNote ? (
                  <NoteEditor
                    mode="create"
                    initialSection={activeSection || ""}
                    initialCategoryId={activeCategory || ""}
                    onSave={handleSaveNote}
                    onCancel={handleCancel}
                    isAdvancedMode={isAdvancedMode}
                    categories={categories}
                  />
                ) : selectedNote ? (
                  <NoteEditor
                    mode="edit"
                    initialTitle={selectedNote.title}
                    initialContent={selectedNote.content}
                    initialSection={selectedNote.section || ""}
                    initialCategoryId={selectedNote.categoryId || ""}
                    onSave={handleSaveNote}
                    onCancel={handleCancel}
                    isAdvancedMode={isAdvancedMode}
                    categories={categories}
                  />
                ) : null}
              </div>
            ) : filteredNotes.length > 0 ? (
              <NotesList
                notes={filteredNotes}
                selectedNoteId={selectedNoteId}
                onSelectNote={handleSelectNote}
                onDeleteNote={handleDeleteNote}
                isAdvancedMode={isAdvancedMode}
                favoriteNotes={favoriteNotes}
                onToggleFavorite={toggleFavorite}
                categories={categories}
              />
            ) : (
              <div className={`text-center py-12 border border-dashed rounded-lg ${
                isAdvancedMode
                  ? "border-slate-700/70 bg-slate-800/50"
                  : "border-gray-200 bg-gray-50/50"
              }`}>
                <div className={`inline-flex p-3 rounded-full mb-3 ${
                  isAdvancedMode
                    ? "bg-slate-700"
                    : "bg-indigo-50"
                }`}>
                  <FaStickyNote className={isAdvancedMode ? "text-indigo-400" : "text-indigo-500"} size={18} />
                </div>
                <p className={`${isAdvancedMode ? "text-slate-300" : "text-gray-600"} text-sm font-medium`}>
                  {searchQuery
                    ? "No notes found matching your search"
                    : showFavoritesOnly
                      ? "No favorite notes yet"
                      : activeCategory
                        ? `No notes in category "${getCategoryById(activeCategory)?.name || 'Unknown'}"`
                        : activeSection
                          ? `No notes with tag "${activeSection}"`
                          : "No notes created yet"}
                </p>
                <p className={`text-xs ${isAdvancedMode ? "text-slate-400" : "text-gray-500"} mt-1`}>
                  {searchQuery
                    ? "Try a different search term"
                    : "Create your first note to get started"}
                </p>
                <Button
                  onClick={handleCreateNote}
                  size="sm"
                  variant={isAdvancedMode ? "outline" : "ghost"}
                  className={`mt-4 ${
                    isAdvancedMode
                      ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                      : "text-indigo-600 hover:text-indigo-700"
                  }`}
                >
                  <FaPlus className="mr-1.5" size={10} /> Create Note
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
