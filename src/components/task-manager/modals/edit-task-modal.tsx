"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/context/app-settings-context";
import { useProjectContext } from "@/context/project-context";
import { useTaskContext } from "@/context/task-context";
import type { DayOfWeek, Priority, SubTask, Task } from "@/lib/types";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaFlag,
  FaListUl,
  FaPlus,
  FaProjectDiagram,
  FaSave,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
}: EditTaskModalProps) {
  const { editTask, addSubtask, toggleSubtask, deleteSubtask } =
    useTaskContext();
  const { projects } = useProjectContext();
  const { settings } = useAppSettings();

  const [title, setTitle] = useState<string>(task.title);
  const [day, setDay] = useState<DayOfWeek>(task.day);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [pomodoroEstimate, setPomodoroEstimate] = useState<number>(
    task.pomodoroEstimate || 0,
  );
  const [projectId, setProjectId] = useState<string>(task.projectId || "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDay(task.day);
    setPriority(task.priority);
    setPomodoroEstimate(task.pomodoroEstimate || 0);
    setProjectId(task.projectId || "");
  }, [task]);

  const handleSubmit = () => {
    const updates: Partial<Omit<Task, "id">> = {
      title,
      day,
      priority,
    };

    if (settings.advancedMode) {
      updates.pomodoroEstimate = pomodoroEstimate || undefined;
      updates.projectId = projectId || undefined;
    }

    editTask(task.id, updates);
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle("");
    }
  };

  // Define priority colors
  const priorityColors = settings.advancedMode
    ? {
        low: "bg-green-900/50 text-green-300 border-green-800",
        medium: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
        high: "bg-red-900/50 text-red-300 border-red-800",
      }
    : {
        low: "bg-blue-50 text-blue-600 border-blue-200",
        medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
        high: "bg-red-50 text-red-600 border-red-200",
      };

  // Get currently selected priority color
  const selectedPriorityColor = priorityColors[priority];

  // Define consistent styles for the advanced mode
  const advancedStyles = settings.advancedMode
    ? {
        background: "bg-gradient-to-b from-slate-800 to-slate-900",
        text: "text-white",
        border: "border-slate-700",
        inputBg: "bg-slate-800",
        inputBorder: "border-slate-700",
        labelText: "text-slate-200",
        buttonBg: "bg-blue-600",
        buttonHover: "hover:bg-blue-700",
        subtaskBg: "bg-slate-700/50",
        subtaskItem: "bg-slate-800",
        subtaskText: "text-white",
        focusRing: "focus:ring-blue-500/30",
        focusBorder: "focus:border-blue-500",
        icon: "text-slate-400",
        modalHeader:
          "bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700",
        title: "text-white font-bold tracking-wide",
      }
    : {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`sm:max-w-[600px] max-h-[90vh] overflow-hidden ${advancedStyles.background} ${advancedStyles.text} ${advancedStyles.border} shadow-xl`}
      >
        <DialogHeader
          className={`${advancedStyles.modalHeader} -mx-6 -mt-6 px-6 py-3 mb-4`}
        >
          <DialogTitle
            className={`flex items-center gap-2 text-xl ${advancedStyles.title}`}
          >
            <FaListUl
              className={`${settings.advancedMode ? "text-blue-400" : "text-indigo-600"}`}
            />
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2 px-1 max-h-[calc(90vh-12rem)] overflow-y-auto custom-scrollbar">
          <div className="grid gap-2">
            <label
              htmlFor="edit-task-title"
              className={`text-sm font-medium ${advancedStyles.labelText}`}
            >
              Task Title
            </label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full h-9 py-2 text-sm ${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} ${advancedStyles.focusBorder} ${advancedStyles.focusRing}`}
              placeholder="Enter task title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Day Selection with icon */}
            <div className="grid gap-2">
              <label
                htmlFor="edit-task-day"
                className={`text-sm font-medium flex items-center gap-1.5 ${advancedStyles.labelText}`}
              >
                <FaCalendarAlt className={advancedStyles.icon} size={14} />
                Day
              </label>
              <div className="relative">
                <select
                  id="edit-task-day"
                  value={day}
                  onChange={(e) => setDay(e.target.value as DayOfWeek)}
                  className={`w-full h-9 py-2 pl-4 pr-10 rounded-lg border appearance-none capitalize text-sm ${
                    settings.advancedMode
                      ? `${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} focus:outline-none ${advancedStyles.focusBorder} focus:ring-1 ${advancedStyles.focusRing}`
                      : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  }`}
                >
                  {[
                    "saturday",
                    "sunday",
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                  ].map((dayOption) => (
                    <option
                      key={dayOption}
                      value={dayOption}
                      className={
                        settings.advancedMode ? "bg-slate-800 text-white" : ""
                      }
                    >
                      {dayOption.charAt(0).toUpperCase() + dayOption.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Priority Selection with icon and custom styling */}
            <div className="grid gap-2">
              <label
                htmlFor="edit-task-priority"
                className={`text-sm font-medium flex items-center gap-1.5 ${advancedStyles.labelText}`}
              >
                <FaFlag className={advancedStyles.icon} size={14} />
                Priority
              </label>
              <div className="relative">
                <select
                  id="edit-task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={`w-full py-2.5 pl-4 pr-10 rounded-lg border appearance-none ${selectedPriorityColor} focus:outline-none ${
                    settings.advancedMode
                      ? `${advancedStyles.focusBorder} focus:ring-1 ${advancedStyles.focusRing}`
                      : "focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  }`}
                >
                  <option
                    value="low"
                    className={
                      settings.advancedMode
                        ? "bg-slate-800 text-green-300"
                        : "bg-white text-blue-600"
                    }
                  >
                    Low priority
                  </option>
                  <option
                    value="medium"
                    className={
                      settings.advancedMode
                        ? "bg-slate-800 text-yellow-300"
                        : "bg-white text-yellow-600"
                    }
                  >
                    Medium priority
                  </option>
                  <option
                    value="high"
                    className={
                      settings.advancedMode
                        ? "bg-slate-800 text-red-300"
                        : "bg-white text-red-600"
                    }
                  >
                    High priority
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {settings.advancedMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Pomodoro Selection with icon */}
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-task-pomodoro"
                    className={`text-sm font-medium flex items-center gap-1.5 ${advancedStyles.labelText}`}
                  >
                    <FaClock className={advancedStyles.icon} size={14} />
                    Pomodoro Estimate
                  </label>
                  <div className="relative">
                    <select
                      id="edit-task-pomodoro"
                      value={pomodoroEstimate}
                      onChange={(e) =>
                        setPomodoroEstimate(Number.parseInt(e.target.value))
                      }
                      className={`w-full h-9 py-2 pl-4 pr-10 rounded-lg border appearance-none text-sm ${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} focus:outline-none ${advancedStyles.focusBorder} focus:ring-1 ${advancedStyles.focusRing}`}
                    >
                      <option value="0" className="bg-slate-800 text-white">
                        None
                      </option>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option
                          key={num}
                          value={num}
                          className="bg-slate-800 text-white"
                        >
                          {num} {num === 1 ? "Pomodoro" : "Pomodoros"}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Project Selection with icon */}
                <div className="grid gap-2">
                  <label
                    htmlFor="edit-task-project"
                    className={`text-sm font-medium flex items-center gap-1.5 ${advancedStyles.labelText}`}
                  >
                    <FaProjectDiagram
                      className={advancedStyles.icon}
                      size={14}
                    />
                    Project
                  </label>
                  <div className="relative">
                    <select
                      id="edit-task-project"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className={`w-full h-9 py-2 pl-4 pr-10 rounded-lg border appearance-none text-sm ${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} focus:outline-none ${advancedStyles.focusBorder} focus:ring-1 ${advancedStyles.focusRing}`}
                    >
                      <option value="" className="bg-slate-800 text-white">
                        No Project
                      </option>
                      {projects.map((project) => (
                        <option
                          key={project.id}
                          value={project.id}
                          className="bg-slate-800 text-white"
                        >
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtasks Management - Enhanced with better styling */}
              <div className="mt-2">
                <label
                  className={`text-sm font-medium flex items-center gap-1.5 mb-3 ${advancedStyles.labelText}`}
                >
                  <FaListUl className={advancedStyles.icon} size={14} />
                  Subtasks
                </label>

                {task.subtasks && task.subtasks.length > 0 ? (
                  <div
                    className={`space-y-2 mb-4 max-h-[200px] overflow-y-auto p-3 ${advancedStyles.subtaskBg} rounded-lg border ${advancedStyles.inputBorder} custom-scrollbar`}
                  >
                    {task.subtasks.map((subtask: SubTask) => (
                      <div
                        key={subtask.id}
                        className={`flex items-center justify-between p-2.5 border ${advancedStyles.inputBorder} rounded-lg ${advancedStyles.subtaskItem} transition-all duration-200 hover:shadow-md`}
                      >
                        <div className="flex items-center overflow-hidden max-w-[90%]">
                          <button
                            onClick={() => toggleSubtask(task.id, subtask.id)}
                            className={`min-w-5 h-5 rounded-full mr-2.5 transition-colors duration-200 ${
                              subtask.completed
                                ? "bg-green-600 text-white"
                                : "bg-slate-700 hover:bg-slate-600"
                            } flex items-center justify-center flex-shrink-0`}
                            aria-label={
                              subtask.completed
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            {subtask.completed && <FaCheck size={10} />}
                          </button>
                          <span
                            className={`${
                              subtask.completed
                                ? "line-through text-slate-400"
                                : advancedStyles.subtaskText
                            } break-words text-sm`}
                            style={{ wordBreak: "break-word" }}
                          >
                            {subtask.title}
                          </span>
                        </div>
                        <Button
                          onClick={() => deleteSubtask(task.id, subtask.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2 p-1 rounded-full hover:bg-red-900/30"
                          aria-label="Delete subtask"
                        >
                          <FaTrash className="text-base" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-slate-400 text-sm mb-4 p-4 rounded-lg border ${advancedStyles.inputBorder} ${advancedStyles.subtaskBg} flex justify-center items-center`}
                  >
                    No subtasks added yet
                  </div>
                )}

                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Add a new subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSubtask();
                      }}
                      className={`h-9 pl-4 ${advancedStyles.inputBg} ${advancedStyles.inputBorder} ${advancedStyles.text} ${advancedStyles.focusBorder} ${advancedStyles.focusRing}`}
                    />
                  </div>
                  <Button
                    onClick={handleAddSubtask}
                    size="sm"
                    className={`${advancedStyles.buttonBg} ${advancedStyles.buttonHover} flex-shrink-0`}
                  >
                    <FaPlus className="mr-2 text-base" /> Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end space-x-3 mt-5 border-t pt-4 border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={`transition-colors ${settings.advancedMode ? `${advancedStyles.inputBg} ${advancedStyles.inputBorder} text-slate-300 hover:bg-slate-700 hover:text-white` : ""}`}
          >
            <FaTimes className="mr-2 text-base" /> Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            className={`transition-colors ${settings.advancedMode ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" : ""}`}
          >
            <FaSave className="mr-2 text-base" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
