import { Button } from "@/components/ui/button";
import { useNoteContext } from "@/context/note-context";
import { useAppSettings } from "@/context/app-settings-context";
import { useState } from "react";
import { FaPlus, FaStickyNote, FaChevronLeft, FaEllipsisH } from "react-icons/fa";
import NoteEditor from "../notes/note-editor";
import NotesList from "../notes/notes-list";

export default function NotesWidget() {
  const { notes, addNote, updateNote, deleteNote } = useNoteContext();
  const { settings } = useAppSettings();
  const isAdvancedMode = settings.advancedMode;

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showNotesList, setShowNotesList] = useState(true);

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsCreatingNote(false);
    setShowNotesList(false);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(true);
    setShowNotesList(false);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (isCreatingNote) {
      addNote(title, content);
      setIsCreatingNote(false);
    } else if (selectedNoteId) {
      updateNote(selectedNoteId, title, content);
    }
    setShowNotesList(true);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const handleCancel = () => {
    setSelectedNoteId(null);
    setIsCreatingNote(false);
    setShowNotesList(true);
  };

  return (
    <div className="w-full h-full">
      {showNotesList ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-xs font-medium ${isAdvancedMode ? "text-slate-100" : "text-gray-700"}`}>
              Your Notes
            </h3>
            <Button
              onClick={handleCreateNote}
              size="sm"
              variant={isAdvancedMode ? "default" : "outline"}
              className={`h-7 px-2 transition-all ${
                isAdvancedMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              }`}
            >
              <FaPlus className="mr-1" size={10} /> New Note
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className={`text-center py-4 border border-dashed rounded-lg ${
              isAdvancedMode
                ? "border-slate-700/70 bg-slate-800/50"
                : "border-gray-200 bg-gray-50/50"
            }`}>
              <div className={`inline-flex p-2 rounded-full mb-2 ${
                isAdvancedMode
                  ? "bg-slate-700"
                  : "bg-indigo-50"
              }`}>
                <FaStickyNote className={isAdvancedMode ? "text-indigo-400" : "text-indigo-500"} size={14} />
              </div>
              <p className={`${isAdvancedMode ? "text-slate-300" : "text-gray-600"} text-xs font-medium`}>
                No notes yet
              </p>
              <p className={`text-[10px] ${isAdvancedMode ? "text-slate-400" : "text-gray-500"} mt-1`}>
                Create your first note to get started
              </p>
              <Button
                onClick={handleCreateNote}
                size="sm"
                variant={isAdvancedMode ? "outline" : "ghost"}
                className={`mt-2 ${
                  isAdvancedMode
                    ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                <FaPlus className="mr-1" size={10} /> Create Note
              </Button>
            </div>
          ) : (
            <NotesList
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
            />
          )}
        </div>
      ) : (
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
              onSave={handleSaveNote}
              onCancel={handleCancel}
              isAdvancedMode={isAdvancedMode}
              categories={[]}
            />
          ) : selectedNote ? (
            <NoteEditor
              mode="edit"
              initialTitle={selectedNote.title}
              initialContent={selectedNote.content}
              onSave={handleSaveNote}
              onCancel={handleCancel}
              isAdvancedMode={isAdvancedMode}
              categories={[]}
            />
          ) : (
            <div className={`flex flex-col items-center justify-center h-40 rounded-lg ${
              isAdvancedMode
                ? "bg-slate-800/50"
                : "bg-gray-50/50"
            }`}>
              <FaStickyNote className={isAdvancedMode ? "text-indigo-400 mb-3" : "text-indigo-500 mb-3"} size={24} />
              <p className={`text-sm ${isAdvancedMode ? "text-slate-300" : "text-gray-600"} font-medium`}>
                No note selected
              </p>
              <Button
                onClick={handleCreateNote}
                variant={isAdvancedMode ? "outline" : "ghost"}
                size="sm"
                className={`mt-3 ${
                  isAdvancedMode
                    ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                    : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                <FaPlus className="mr-1.5" size={10} /> New Note
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
