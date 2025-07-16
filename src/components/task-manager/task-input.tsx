"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/context/app-settings-context";
import { useProjectContext } from "@/context/project-context";
import { useTaskContext } from "@/context/task-context";
import type { DayOfWeek, Priority } from "@/lib/types";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaFlag,
  FaPlus,
  FaProjectDiagram,
} from "react-icons/fa";

export default function TaskInput() {
  const { addTask } = useTaskContext();
  const { projects } = useProjectContext();
  const { settings } = useAppSettings();

  const [title, setTitle] = useState<string>("");
  const [day, setDay] = useState<DayOfWeek>("saturday");
  const [priority, setPriority] = useState<Priority>("low");
  const [pomodoroEstimate, setPomodoroEstimate] = useState<number>(0);
  const [projectId, setProjectId] = useState<string>("");

  const handleAddTask = () => {
    if (title.trim()) {
      if (settings.advancedMode) {
        // In advanced mode, pass all parameters
        addTask(
          title,
          day,
          priority,
          pomodoroEstimate > 0 ? pomodoroEstimate : undefined,
          projectId || undefined,
        );
      } else {
        // In basic mode, just pass the basic parameters
        addTask(title, day, priority);
      }
      setTitle("");
    }
  };

  // Define colors for priority selection
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

  return (
    <div
      className={`${settings.advancedMode
        ? 'bg-gradient-to-b from-slate-800 to-slate-900 p-3 rounded-xl border border-slate-700 shadow-md'
        : ''} w-full`}
    >
      <form
        className={`flex flex-col gap-3 md:flex-row md:items-center md:gap-2 w-full`}
        onSubmit={e => { e.preventDefault(); handleAddTask(); }}
      >
        <Input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTask();
            }
          }}
          className={`flex-1 min-w-0 py-1.5 px-2 text-sm shadow-sm rounded-lg transition-all duration-200 ${
            settings.advancedMode
              ? "bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/30 h-8"
              : "border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10"
          }`}
          data-tutorial-id="task-input"
        />
        {/* Day Selection */}
        <div className="relative w-full md:w-32">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <FaCalendarAlt />
          </div>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek)}
            className={`w-full pl-9 pr-4 py-2 rounded-lg border shadow-sm focus:outline-none capitalize appearance-none text-sm ${
              settings.advancedMode
                ? "bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 h-10"
                : "bg-white border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-11"
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
                className={settings.advancedMode ? "bg-slate-800 text-white" : ""}
              >
                {dayOption.charAt(0).toUpperCase() + dayOption.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Priority Selection */}
        <div className="relative w-full md:w-28">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={`w-full pl-4 pr-4 py-2 rounded-lg border shadow-sm focus:outline-none appearance-none text-sm ${selectedPriorityColor} h-10`}
          >
            <option value="low" className={settings.advancedMode ? "bg-slate-800 text-green-300" : "bg-white text-blue-600"}>Low priority</option>
            <option value="medium" className={settings.advancedMode ? "bg-slate-800 text-yellow-300" : "bg-white text-yellow-600"}>Medium priority</option>
            <option value="high" className={settings.advancedMode ? "bg-slate-800 text-red-300" : "bg-white text-red-600"}>High priority</option>
          </select>
        </div>
        {/* Pomodoro Estimate (Advanced Mode) */}
        {settings.advancedMode && (
          <div className="relative w-full md:w-48">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <FaClock />
            </div>
            <select
              value={pomodoroEstimate}
              onChange={(e) => setPomodoroEstimate(Number.parseInt(e.target.value))}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-600 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-slate-800 text-white appearance-none text-sm h-10"
            >
              <option value="0" className="bg-slate-800 text-white">Pomodoros: None</option>
              {[1,2,3,4,5,6,8,10].map((num) => (
                <option key={num} value={num} className="bg-slate-800 text-white">{num} {num === 1 ? "Pomodoro" : "Pomodoros"}</option>
              ))}
            </select>
          </div>
        )}
        {/* Project Selection (Advanced Mode) */}
        {settings.advancedMode && (
          <div className="relative w-full md:w-32">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <FaProjectDiagram />
            </div>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-600 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 bg-slate-800 text-white appearance-none text-sm h-10"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-slate-800 text-white">{project.name}</option>
              ))}
            </select>
          </div>
        )}
        <Button
          type="submit"
          size="sm"
          className="flex-shrink-0 mt-2 md:mt-0"
          data-tutorial-id="add-task-btn"
        >
          <FaPlus className="mr-2 text-base" /> Add Task
        </Button>
      </form>
    </div>
  );
}
