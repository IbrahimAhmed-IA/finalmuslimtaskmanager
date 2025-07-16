import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppSettings } from "@/context/app-settings-context";
import { usePomodoroContext } from "@/context/pomodoro-context";
import { useTaskContext } from "@/context/task-context";
import Link from "next/link";
import {
  FaPause, FaPlay, FaRedo, FaForward, FaClock,
  FaCheck, FaHeadphones, FaEllipsisH
} from "react-icons/fa";

interface Task {
  currentPomodoroTask?: boolean;
  title: string;
  pomodoroEstimate?: number;
  pomodorosCompleted?: number;
}

export default function PomodoroWidget() {
  const {
    isRunning,
    timerType,
    timeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    settings,
    completedPomodoros,
    pomodoroCount,
    focusMinutes,
    focusMinutesToday,
    focusMinutesThisWeek,
  } = usePomodoroContext();

  const { tasks } = useTaskContext();
  const { settings: appSettings } = useAppSettings();
  const isAdvancedMode = appSettings.advancedMode;

  // Find current pomodoro task if any
  const currentTask = tasks.find((task) => !!(task as any).currentPomodoroTask) as Task | undefined;

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    let totalTime = 0;

    switch (timerType) {
      case "work":
        totalTime = settings.workDuration * 60;
        break;
      case "shortBreak":
        totalTime = settings.shortBreakDuration * 60;
        break;
      case "longBreak":
        totalTime = settings.longBreakDuration * 60;
        break;
    }

    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Get timer type label
  const getTimerTypeLabel = () => {
    switch (timerType) {
      case "work":
        return "Focus";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  // Get icon based on timer type
  const getTimerIcon = () => {
    switch (timerType) {
      case "work":
        return <FaClock className="mr-1.5" />;
      case "shortBreak":
        return <FaCheck className="mr-1.5" />;
      case "longBreak":
        return <FaHeadphones className="mr-1.5" />;
    }
  };

  // Get color based on timer type
  const getTimerColor = () => {
    switch (timerType) {
      case "work":
        return isAdvancedMode
          ? "text-indigo-400 border-indigo-600/50"
          : "text-indigo-600 border-indigo-200";
      case "shortBreak":
        return isAdvancedMode
          ? "text-emerald-400 border-emerald-600/50"
          : "text-emerald-600 border-emerald-200";
      case "longBreak":
        return isAdvancedMode
          ? "text-blue-400 border-blue-600/50"
          : "text-blue-600 border-blue-200";
    }
  };

  const getProgressColor = () => {
    switch (timerType) {
      case "work":
        return isAdvancedMode
          ? "bg-indigo-600"
          : "bg-indigo-500";
      case "shortBreak":
        return isAdvancedMode
          ? "bg-emerald-600"
          : "bg-emerald-500";
      case "longBreak":
        return isAdvancedMode
          ? "bg-blue-600"
          : "bg-blue-500";
    }
  };

  const getButtonColor = () => {
    switch (timerType) {
      case "work":
        return isAdvancedMode
          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white";
      case "shortBreak":
        return isAdvancedMode
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-emerald-600 hover:bg-emerald-700 text-white";
      case "longBreak":
        return isAdvancedMode
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  // Calculate stroke dash array for circular progress
  const calculateStrokeDashArray = () => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - calculateProgress() / 100);

    return {
      strokeDasharray: `${dashArray}`,
      strokeDashoffset: `${dashOffset}`,
    };
  };

  const { strokeDasharray, strokeDashoffset } = calculateStrokeDashArray();

  // Show total minutes achieved
  // const totalMinutes = focusMinutes;

  return (
    <div className={`flex flex-col items-center p-2 rounded-xl ${
      isAdvancedMode
        ? 'bg-slate-800/30 backdrop-blur-sm'
        : 'bg-white/50 backdrop-blur-sm border border-gray-100/30'
    }`}>
      {/* Timer Type Pill */}
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs mb-3 ${getTimerColor()} ${
        isAdvancedMode
          ? 'bg-opacity-20 bg-current'
          : 'bg-opacity-10 bg-current'
      }`}>
        {getTimerIcon()}
        <span className="font-medium">{getTimerTypeLabel()}</span>
        {completedPomodoros > 0 && (
          <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
            isAdvancedMode
              ? 'bg-slate-700/80'
              : 'bg-white/80 shadow-sm'
          }`}>
            {completedPomodoros}
          </span>
        )}
      </div>
      {/* Total Minutes Achieved */}
      <div className={`text-xs font-semibold mb-1 ${isAdvancedMode ? 'text-blue-300' : 'text-indigo-600'}`}>Today: {focusMinutesToday} min</div>
      <div className={`text-xs font-semibold mb-2 ${isAdvancedMode ? 'text-blue-300' : 'text-indigo-600'}`}>This Week: {focusMinutesThisWeek} min</div>

      {/* Timer Display with Circular Progress */}
      <div className="relative mb-4 flex items-center justify-center">
        <div
          className={`absolute w-28 h-28 rounded-full ${
            isAdvancedMode
              ? 'bg-slate-700/40'
              : 'bg-gray-100/40'
          }`}
        />
        <svg className="w-28 h-28 -rotate-90 relative z-10">
          <circle
            cx="56"
            cy="56"
            r="35"
            fill="none"
            stroke={isAdvancedMode ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.6)"}
            strokeWidth="8"
            className="opacity-40"
          />
          <circle
            cx="56"
            cy="56"
            r="35"
            fill="none"
            className={`transition-all duration-1000 ease-linear ${getProgressColor()}`}
            strokeWidth="8"
            strokeLinecap="round"
            style={{ strokeDasharray, strokeDashoffset }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <span className={`text-2xl font-bold tracking-wide ${
              isAdvancedMode
                ? "text-white"
                : "text-gray-800"
            }`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Current Task (if any) */}
      {currentTask && timerType === "work" && (
        <div className={`w-full px-2 py-2 mb-3 rounded-lg text-xs ${
          isAdvancedMode
            ? "bg-slate-700/60 border border-slate-600/40"
            : "bg-white/90 border border-gray-200/70 shadow-sm"
        }`}>
          <p className={`${
            isAdvancedMode
              ? "text-gray-300"
              : "text-gray-600"
            } font-medium text-[10px] mb-1`}>
            Current Task:
          </p>
          <p className={`${
            isAdvancedMode
              ? "text-white"
              : "text-gray-800"
            } truncate font-medium`}>
            {currentTask.title}
          </p>
          {typeof currentTask.pomodoroEstimate === "number" && currentTask.pomodoroEstimate > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex-1">
                <Progress
                  value={(currentTask.pomodorosCompleted || 0) / currentTask.pomodoroEstimate * 100}
                  className={`h-1 ${
                    isAdvancedMode
                      ? "bg-slate-600/50"
                      : "bg-gray-100"
                  }`}
                />
              </div>
              <span className={`text-[10px] ml-2 font-medium ${
                isAdvancedMode
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}>
                {currentTask.pomodorosCompleted || 0}/{currentTask.pomodoroEstimate}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        {isRunning ? (
          <Button
            onClick={pauseTimer}
            className={`${getButtonColor()} px-5 py-2 rounded-full shadow-md h-auto`}
          >
            <FaPause className="mr-1.5" size={12} /> Pause
          </Button>
        ) : (
          <Button
            onClick={startTimer}
            className={`${getButtonColor()} px-5 py-2 rounded-full shadow-md h-auto`}
          >
            <FaPlay className="mr-1.5" size={12} /> Start
          </Button>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={resetTimer}
            variant={isAdvancedMode ? "secondary" : "outline"}
            size="icon"
            className={`h-10 w-10 rounded-full shadow-sm ${
              isAdvancedMode
                ? "border-slate-600/50 text-slate-300 hover:bg-slate-700/60 bg-slate-800/60"
                : "border-gray-200 text-gray-500 hover:bg-gray-50/80"
            }`}
          >
            <FaRedo size={14} />
          </Button>
          <Button
            onClick={skipTimer}
            variant={isAdvancedMode ? "secondary" : "outline"}
            size="icon"
            className={`h-10 w-10 rounded-full shadow-sm ${
              isAdvancedMode
                ? "border-slate-600/50 text-slate-300 hover:bg-slate-700/60 bg-slate-800/60"
                : "border-gray-200 text-gray-500 hover:bg-gray-50/80"
            }`}
          >
            <FaForward size={14} />
          </Button>
        </div>
      </div>

      {/* View Full Timer Link */}
      <Link
        href="/pomodoro"
        className={`text-sm py-1.5 px-3 rounded-md transition-colors ${
          isAdvancedMode
            ? "text-blue-400 hover:bg-blue-900/30"
            : "text-indigo-600 hover:bg-indigo-50/80 font-medium"
        }`}
      >
        View full timer
      </Link>
    </div>
  );
}
