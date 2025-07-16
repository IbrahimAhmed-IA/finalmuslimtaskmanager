"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppSettings } from "@/context/app-settings-context";
import { usePomodoroContext } from "@/context/pomodoro-context";
import { useTaskContext } from "@/context/task-context";
import type { DayOfWeek } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { FaCheckCircle, FaSort, FaUndoAlt, FaEllipsisV } from "react-icons/fa";
import RepeatTaskModal from "./modals/repeat-task-modal";
import TaskColumn from "./task-column";
import TaskInput from "./task-input";
import { createPortal } from "react-dom";

export default function TaskManager() {
  const {
    getOverallProgress,
    uncheckAllTasks,
    sortTasks,
    selectedTasks,
    setSelectedTasks,
    tasks,
    incrementTaskPomodoro,
  } = useTaskContext();

  const { settings } = useAppSettings();
  const { onPomodoroComplete } = usePomodoroContext();

  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsButtonRef = useRef(null);

  const progressPercentage = getOverallProgress();

  useEffect(() => {
    if (!onPomodoroComplete) return;

    const handlePomodoroComplete = () => {
      const currentTask = tasks.find((task) => task.currentPomodoroTask);
      if (currentTask) {
        incrementTaskPomodoro(currentTask.id);
      }
    };

    onPomodoroComplete(handlePomodoroComplete);
  }, [tasks, onPomodoroComplete, incrementTaskPomodoro]);

  const handleRepeatTasks = () => {
    if (selectedTasks.length === 0) return;
    setShowRepeatModal(true);
  };

  const handleRepeatModalClose = () => {
    setShowRepeatModal(false);
  };

  const handleUncheckAllTasks = () => {
    uncheckAllTasks();
  };

  const days: DayOfWeek[] = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  const getCurrentDay = (): DayOfWeek => {
    const daysMap: Record<number, DayOfWeek> = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };
    const dayIndex = new Date().getDay();
    return daysMap[dayIndex];
  };

  const currentDay = getCurrentDay();

  const remainingDays = days.filter((day) => day !== currentDay);

  return (
    <div
      className={`task-manager w-full fade-in ${settings.advancedMode ? "text-white" : ""}`}
    >
      <div className="container mx-auto p-4">
        {/* Progress card with improved design */}
        <div
          className={`card mb-2 transition-all rounded-lg overflow-visible ${
            settings.advancedMode
              ? "bg-slate-800/90 border border-slate-700/70 p-2 shadow-none"
              : "bg-white/90 border border-gray-200 p-4 shadow-none"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center mr-3 shadow-lg transition-all ${
                  settings.advancedMode
                    ? progressPercentage >= 75
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-400/30"
                      : progressPercentage >= 50
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-400/30"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-400/30"
                    : progressPercentage >= 75
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-emerald-300/30"
                      : progressPercentage >= 50
                        ? "bg-gradient-to-br from-blue-400 to-indigo-500 ring-2 ring-blue-300/30"
                        : "bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-indigo-300/30"
                }`}
              >
                <span className="text-white font-bold text-base">
                  {progressPercentage}%
                </span>
              </div>
              <div>
                <h2
                  className={`text-lg font-semibold ${settings.advancedMode ? "text-white" : "text-gray-800"}`}
                >
                  Today's Progress
                </h2>
                <p
                  className={
                    settings.advancedMode
                      ? "text-slate-300 text-xs"
                      : "text-gray-500 text-sm"
                  }
                >
                  {progressPercentage >= 75
                    ? "Amazing work, almost there!"
                    : progressPercentage >= 50
                      ? "Keep going, you're on track!"
                      : "Focus on your tasks today"}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-4/5">
              <Progress
                value={progressPercentage}
                className={`h-3 w-full rounded-full ${
                  settings.advancedMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              />
            </div>
          </div>

          {/* Task input section with improved styling */}
          <div
            className={`${
              settings.advancedMode
                ? "bg-slate-900/80 border border-slate-700/70"
                : "bg-gray-50/90 border border-gray-100"
            } p-3 rounded-xl mb-4 shadow-sm`}
          >
            <h3
              className={`text-base font-medium mb-2 ${settings.advancedMode ? "text-slate-200" : "text-gray-700"}`}
            >
              Add New Task
            </h3>
            <TaskInput />
          </div>
        </div>

        {/* Day columns with improved styling */}
        <div className="grid grid-cols-1 gap-4">
          <div key={currentDay} className="slide-up">
            <div className="mb-1 flex items-center">
              <span
                className={`font-medium text-base ${settings.advancedMode ? "text-white" : "text-gray-700"}`}
              >
                Today
              </span>
              <span
                className={`${settings.advancedMode ? "text-blue-300" : "text-blue-600"} ml-2 font-medium capitalize text-sm`}
              >
                ({currentDay})
              </span>
            </div>
            <TaskColumn day={currentDay} isCurrentDay={true} />
          </div>

          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-slate-700">
            <h3 className={`text-base font-medium mb-2 ${settings.advancedMode ? "text-slate-300" : "text-gray-700"}`}>
              Upcoming Days
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {remainingDays.map((day, index) => (
                <div
                  key={day}
                  className="slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TaskColumn day={day} isCurrentDay={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RepeatTaskModal
        isOpen={showRepeatModal}
        onClose={handleRepeatModalClose}
        taskIds={selectedTasks}
        onTasksRepeated={() => {
          setSelectedTasks([]);
          setShowRepeatModal(false);
        }}
      />
    </div>
  );
}
