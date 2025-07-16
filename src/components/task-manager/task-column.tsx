"use client";

import { useAppSettings } from "@/context/app-settings-context";
import { useTaskContext } from "@/context/task-context";
import type { DayOfWeek } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaTasks } from "react-icons/fa";
import { toast } from "sonner";
import TaskItem from "./task-item";

interface TaskColumnProps {
  day: DayOfWeek;
  isCurrentDay?: boolean;
}

export default function TaskColumn({
  day,
  isCurrentDay = false,
}: TaskColumnProps) {
  const { getTasksByDay, getDayProgress, selectedTasks, toggleSelectTask } =
    useTaskContext();
  const { settings } = useAppSettings();

  const tasks = getTasksByDay(day);
  const progress = getDayProgress(day);
  const [message, setMessage] = useState<string | null>(null);

  // Track previous progress with ref to avoid showing toast on initial load
  const previousProgressRef = useRef(progress);

  // Handle progress messages and toast notifications
  useEffect(() => {
    // Only show messages when there are tasks
    if (tasks.length === 0) {
      setMessage(null);
      previousProgressRef.current = progress;
      return;
    }

    let newMessage = null;
    let title = "";

    if (progress === 100 && tasks.length > 0) {
      title = "✨ Achievement Unlocked! ✨";
      newMessage =
        'Congratulations! You\'ve reached 100%! Incredible effort! Allah says:\n"إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ إِنَّا لَا نُضِيعُ أَجْرَ مَنْ أَحْسَنَ عَمَلًا"\nNow, take a moment to thank Allah for guided you to complete your tasks.';
    } else if (progress >= 75 && previousProgressRef.current < 75) {
      title = "🌟 Almost There! 🌟";
      newMessage =
        'Great work! You\'re almost there—just a bit more to go. Always keep in mind:\n"وَأَنَّ سَعْيَهُ سَوْفَ يُرَىٰ"';
    } else if (progress >= 50 && previousProgressRef.current < 50) {
      title = "🔆 Milestone Reached! 🔆";
      newMessage =
        "Good job! You've passed halfway! There's just a little left. Don't forget:\n\"وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ\"";
    }

    // Show toast notification when progress milestone is reached
    // (not on initial load, only when progress changes)
    if (
      newMessage &&
      previousProgressRef.current !== 0 &&
      ((progress >= 50 && previousProgressRef.current < 50) ||
        (progress >= 75 && previousProgressRef.current < 75) ||
        (progress === 100 && previousProgressRef.current < 100))
    ) {
      toast(title, {
        description: newMessage.split("\n").join(" "),
        duration: 6000,
        icon: progress === 100 ? "🎉" : progress >= 75 ? "🌟" : "🔆",
        position: "top-center",
        className: settings.advancedMode
          ? "bg-slate-800 text-white border-slate-600"
          : "",
      });
    }

    setMessage(newMessage);
    previousProgressRef.current = progress;
  }, [progress, tasks.length, settings.advancedMode]);

  // Format the day name to title case
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Advanced mode styles
  const advancedStyles = settings.advancedMode
    ? {
        columnBg: "bg-slate-800",
        columnBorder: "border border-slate-700",
        text: "text-white",
        mutedText: "text-slate-200",
        progressBg: "bg-slate-700",
        emptyBorder: "border-slate-700",
        emptyText: "text-slate-400",
        emptySubtext: "text-slate-500",
        columnShadow: "shadow-lg shadow-slate-900/30",
        currentDayBorder: isCurrentDay
          ? "ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10"
          : "",
      }
    : {
        currentDayBorder: isCurrentDay
          ? "ring-2 ring-blue-500/30 shadow-lg shadow-blue-400/10"
          : "shadow-md",
      };

  // Get gradient color based on day
  const getDayGradient = (day: DayOfWeek) => {
    if (settings.advancedMode) {
      const gradients = {
        saturday: "from-indigo-900 to-purple-900",
        sunday: "from-blue-900 to-indigo-900",
        monday: "from-sky-900 to-blue-900",
        tuesday: "from-teal-900 to-cyan-900",
        wednesday: "from-emerald-900 to-green-900",
        thursday: "from-orange-900 to-amber-900",
        friday: "from-rose-900 to-red-900",
      };
      return gradients[day] || "from-indigo-900 to-purple-900";
    }

    const gradients = {
      saturday: "from-indigo-600 to-purple-600",
      sunday: "from-blue-600 to-indigo-600",
      monday: "from-sky-500 to-blue-600",
      tuesday: "from-teal-500 to-cyan-500",
      wednesday: "from-emerald-500 to-green-600",
      thursday: "from-orange-500 to-amber-500",
      friday: "from-rose-500 to-red-600",
    };
    return gradients[day] || "from-indigo-600 to-purple-600";
  };

  const dayGradient = getDayGradient(day);

  return (
    <div
      className={`day-column flex flex-col ${
        settings.advancedMode
          ? `${advancedStyles.columnBg} ${advancedStyles.columnBorder} rounded-lg overflow-visible relative z-[-1] px-1 pt-1 pb-1 m-1`
          : `${advancedStyles.currentDayBorder} rounded-lg overflow-visible relative z-[-1] px-1 pt-1 pb-1 m-1`
      }`}
    >
      <h3
        className={`bg-gradient-to-r ${dayGradient} text-white font-semibold tracking-wide flex items-center justify-center h-7 text-[10px] rounded-lg m-0 ${
          isCurrentDay ? "h-8" : ""
        }`}
      >
        <FaCalendarAlt className="mr-1 text-[10px]" />
        {formatDayName(day)}
        {isCurrentDay && (
          <span className="ml-1 text-[8px] font-medium bg-white/20 backdrop-blur-sm px-1 py-0.5 rounded-full">
            Today
          </span>
        )}
      </h3>

      <div
        className={`mb-0.5 px-0.5 pt-0.5 ${settings.advancedMode ? advancedStyles.text : ""}`}
      >
        <div className="flex justify-between items-center mb-1">
          <span
            className={`text-xs font-medium ${
              settings.advancedMode ? advancedStyles.mutedText : "text-gray-700"
            }`}
          >
            Tasks Completed
          </span>
          <span
            className={`text-xs font-bold ${
              progress === 100
                ? settings.advancedMode
                  ? "text-emerald-300"
                  : "text-emerald-600"
                : progress >= 75
                  ? settings.advancedMode
                    ? "text-blue-300"
                    : "text-blue-600"
                  : settings.advancedMode
                    ? advancedStyles.mutedText
                    : "text-gray-700"
            }`}
          >
            {progress}%
          </span>
        </div>

        <div
          className={`progress-bar ${settings.advancedMode ? advancedStyles.progressBg : ""} h-1.5`}
        >
          <div
            className={`progress-value bg-gradient-to-r ${dayGradient}`}
            style={{ width: `${progress}%`, height: '100%' }}
          />
        </div>

        {/* Motivational message based on progress */}
        {message && (
          <div
            className={`mt-1 p-1 rounded-lg text-xs ${
              settings.advancedMode
                ? "bg-slate-700/50 border border-slate-600"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p
              className={`${
                settings.advancedMode ? "text-slate-200" : "text-blue-800"
              }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="px-0.5 pb-0.5 space-y-0.5 overflow-y-visible overflow-x-visible">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-8 text-center ${
              settings.advancedMode
                ? `${advancedStyles.emptyBorder} ${advancedStyles.emptyText} py-4`
                : "text-gray-500"
            }`}
          >
            <FaTasks
              className={`mb-2 ${
                settings.advancedMode ? "text-slate-600" : "text-gray-400"
              }`}
              size={24}
            />
            <p className="font-medium">No tasks for {formatDayName(day)}</p>
            <p
              className={`text-xs mt-1 ${
                settings.advancedMode
                  ? advancedStyles.emptySubtext
                  : "text-gray-400"
              }`}
            >
              Add some tasks to get started
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTasks.includes(task.id)}
              onSelect={toggleSelectTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
