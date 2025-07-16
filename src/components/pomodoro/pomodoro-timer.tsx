"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppSettings } from "@/context/app-settings-context";
import { usePomodoroContext } from "@/context/pomodoro-context";
import { useTaskContext } from "@/context/task-context";
import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaClipboardList,
  FaCog,
  FaForward,
  FaPause,
  FaPlay,
  FaRedo,
  FaBell,
  FaBellSlash,
  FaHistory,
  FaChartLine,
  FaClock,
  FaHeadphones,
  FaMugHot,
  FaRegLightbulb,
} from "react-icons/fa";
import PomodoroSettings from "./pomodoro-settings";

export default function PomodoroTimer() {
  const {
    isRunning,
    timerType,
    timeLeft,
    completedPomodoros,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    changeTimerType,
    pomodoroCount,
    focusMinutesToday,
    focusMinutesThisWeek,
  } = usePomodoroContext();

  const { tasks } = useTaskContext();
  const { settings: appSettings } = useAppSettings();

  const [showSettings, setShowSettings] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission === "granted"
      : false
  );

  // Find current pomodoro task if any
  const currentTask = tasks.find((task) => task.currentPomodoroTask);

  // Update document title with timer
  useEffect(() => {
    if (typeof document === "undefined") return;
    const originalTitle = document.title;
    setDocumentTitle(originalTitle);

    // Update title when timer is running
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${getTimerTitle()}`;
    }

    // Reset title when component unmounts
    return () => {
      if (documentTitle) {
        document.title = documentTitle;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  // Get timer title based on type
  const getTimerTitle = () => {
    switch (timerType) {
      case "work":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  // Get timer icon based on type
  const getTimerIcon = () => {
    switch (timerType) {
      case "work":
        return <FaRegLightbulb className="mr-2" />;
      case "shortBreak":
        return <FaMugHot className="mr-2" />;
      case "longBreak":
        return <FaHeadphones className="mr-2" />;
    }
  };

  // Get background color based on timer type
  const getTimerColor = () => {
    if (appSettings.advancedMode) {
      switch (timerType) {
        case "work":
          return "from-indigo-900 to-blue-900 via-violet-900";
        case "shortBreak":
          return "from-emerald-900 to-teal-900 via-green-900";
        case "longBreak":
          return "from-cyan-900 to-blue-900 via-sky-900";
      }
    }

    switch (timerType) {
      case "work":
        return "from-indigo-600 to-purple-600 via-violet-600";
      case "shortBreak":
        return "from-emerald-500 to-teal-500 via-green-500";
      case "longBreak":
        return "from-blue-500 to-cyan-500 via-sky-500";
    }
  };

  // Get timer accent color
  const getTimerAccentColor = () => {
    switch (timerType) {
      case "work":
        return appSettings.advancedMode ? "border-indigo-600 text-indigo-400" : "border-purple-500 text-purple-600";
      case "shortBreak":
        return appSettings.advancedMode ? "border-emerald-600 text-emerald-400" : "border-green-500 text-green-500";
      case "longBreak":
        return appSettings.advancedMode ? "border-blue-600 text-blue-400" : "border-blue-500 text-blue-500";
    }
  };

  // Get timer button colors
  const getTimerButtonColor = () => {
    if (appSettings.advancedMode) {
      switch (timerType) {
        case "work":
          return "bg-indigo-600 hover:bg-indigo-700 text-white";
        case "shortBreak":
          return "bg-emerald-600 hover:bg-emerald-700 text-white";
        case "longBreak":
          return "bg-blue-600 hover:bg-blue-700 text-white";
      }
    }

    switch (timerType) {
      case "work":
        return "bg-violet-600 hover:bg-violet-700 text-white";
      case "shortBreak":
        return "bg-emerald-500 hover:bg-emerald-600 text-white";
      case "longBreak":
        return "bg-blue-500 hover:bg-blue-600 text-white";
    }
  };

  // Request notification permission
  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((result) => {
        setNotificationsEnabled(result === "granted");
      });
    }
  };

  // Calculate stroke dash array for circular progress
  const calculateStrokeDashArray = () => {
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - calculateProgress() / 100);

    return {
      strokeDasharray: `${dashArray}`,
      strokeDashoffset: `${dashOffset}`,
    };
  };

  const { strokeDasharray, strokeDashoffset } = calculateStrokeDashArray();

  return (
    <div
      className={`py-6 w-full min-h-[calc(100vh-100px)] ${appSettings.advancedMode
        ? "text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
        : "bg-gradient-to-b from-gray-50 to-white"}`}
    >
      <header
        className={`py-10 bg-gradient-to-r ${getTimerColor()} text-white text-center rounded-2xl shadow-xl mb-10 mx-4 enhanced-header`}
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Pomodoro Timer</h1>
              <p className="text-lg opacity-90 max-w-lg">Boost your productivity with focused time blocks</p>
            </div>
            <div className="hidden md:flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {getTimerIcon()}
              <span className="font-medium">{getTimerTitle()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="max-w-5xl mx-auto">
          {/* Timer Type Selector - Redesigned with Pills */}
          <div className="flex justify-center mb-8">
            <div className={`inline-flex p-1 rounded-full ${appSettings.advancedMode ? 'bg-slate-800/90 backdrop-blur-sm' : 'bg-white shadow-lg'}`}>
              <Button
                onClick={() => changeTimerType("work")}
                className={`rounded-full px-6 py-2.5 transition-all duration-300 flex items-center ${
                  timerType === "work"
                    ? `${getTimerButtonColor()} shadow-md transform scale-105`
                    : `${appSettings.advancedMode ? 'bg-transparent text-slate-300 hover:bg-slate-700/50' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <FaRegLightbulb className="mr-2" size={14} /> Focus
              </Button>
              <Button
                onClick={() => changeTimerType("shortBreak")}
                className={`rounded-full px-6 py-2.5 transition-all duration-300 flex items-center ${
                  timerType === "shortBreak"
                    ? `${getTimerButtonColor()} shadow-md transform scale-105`
                    : `${appSettings.advancedMode ? 'bg-transparent text-slate-300 hover:bg-slate-700/50' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <FaMugHot className="mr-2" size={14} /> Short Break
              </Button>
              <Button
                onClick={() => changeTimerType("longBreak")}
                className={`rounded-full px-6 py-2.5 transition-all duration-300 flex items-center ${
                  timerType === "longBreak"
                    ? `${getTimerButtonColor()} shadow-md transform scale-105`
                    : `${appSettings.advancedMode ? 'bg-transparent text-slate-300 hover:bg-slate-700/50' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <FaHeadphones className="mr-2" size={14} /> Long Break
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Main Timer Section */}
            <div className="flex-1 w-full lg:w-auto flex flex-col items-center">
              {/* Current Task Indicator */}
              {timerType === "work" && (
                <div
                  className={`w-full mb-8 p-5 rounded-xl shadow-lg ${
                    appSettings.advancedMode
                      ? currentTask
                        ? "bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm"
                        : "bg-slate-800/50 border border-dashed border-slate-700/50 backdrop-blur-sm"
                      : currentTask
                        ? "glass-card bg-white/90 border border-indigo-100/60"
                        : "glass-card bg-white/80 border-dashed border border-gray-200/60"
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${appSettings.advancedMode ? "bg-slate-700/70" : "bg-indigo-100/80"} mr-4`}>
                      <FaClipboardList className={`${appSettings.advancedMode ? "text-indigo-400" : "text-indigo-600"}`} size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm ${appSettings.advancedMode ? "text-slate-400" : "text-gray-500"} mb-1`}>Current Focus Task:</h3>
                      {currentTask ? (
                        <div>
                          <p className={`font-medium ${appSettings.advancedMode ? "text-white" : "text-gray-800"}`}>
                            {currentTask.title}
                          </p>
                          {currentTask.pomodoroEstimate && currentTask.pomodoroEstimate > 0 && (
                            <div className="mt-3 flex items-center">
                              <div className="flex-1 mr-3">
                                <Progress
                                  value={(currentTask.pomodorosCompleted || 0) / currentTask.pomodoroEstimate * 100}
                                  className={`h-2 ${appSettings.advancedMode ? "bg-slate-700" : "bg-gray-100"}`}
                                />
                              </div>
                              <p className={`text-xs whitespace-nowrap ${appSettings.advancedMode ? "text-slate-400" : "text-gray-500"} flex items-center`}>
                                <FaHistory size={10} className="mr-1" /> {currentTask.pomodorosCompleted || 0} / {currentTask.pomodoroEstimate} pomodoros
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={appSettings.advancedMode ? "text-slate-400" : "text-gray-500"}>
                          No task selected. Set a task as current from the Tasks page.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Circular Timer Display */}
              <div className={`relative w-80 h-80 mb-8 ${appSettings.advancedMode ? 'drop-shadow-2xl' : 'drop-shadow-xl'}`}>
                {/* Background glow effect */}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
                  timerType === "work"
                    ? "bg-indigo-500"
                    : timerType === "shortBreak"
                      ? "bg-emerald-500"
                      : "bg-blue-500"
                }`} />

                {/* SVG Circle for Progress */}
                <svg className="w-full h-full -rotate-90 absolute top-0 left-0">
                  <circle
                    cx="160"
                    cy="160"
                    r="130"
                    fill="none"
                    stroke={appSettings.advancedMode ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.6)"}
                    strokeWidth="15"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="130"
                    fill="none"
                    className={`transition-all duration-1000 ease-linear ${
                      timerType === "work"
                        ? appSettings.advancedMode ? "stroke-indigo-500" : "stroke-violet-500"
                        : timerType === "shortBreak"
                          ? appSettings.advancedMode ? "stroke-emerald-500" : "stroke-emerald-500"
                          : appSettings.advancedMode ? "stroke-blue-500" : "stroke-blue-500"
                    }`}
                    strokeWidth="15"
                    strokeLinecap="round"
                    style={{ strokeDasharray, strokeDashoffset }}
                  />
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-center p-6 rounded-full ${appSettings.advancedMode ? 'bg-slate-800/40 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'} shadow-lg`}>
                    <h2 className={`text-6xl sm:text-7xl font-bold tracking-wider ${appSettings.advancedMode ? "text-white" : "text-gray-800"}`}>
                      {formatTime(timeLeft)}
                    </h2>
                    <p className={`mt-2 ${appSettings.advancedMode ? "text-slate-300" : "text-gray-600"} font-medium text-xl flex justify-center items-center`}>
                      {getTimerIcon()}
                      {getTimerTitle()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timer Control Buttons */}
              <div className="flex justify-center gap-5 mb-8">
                {isRunning ? (
                  <Button
                    onClick={pauseTimer}
                    size="lg"
                    className={`${getTimerButtonColor()} px-8 py-6 rounded-full shadow-lg animate-btn h-auto`}
                  >
                    <FaPause className="mr-2.5" size={18} /> Pause
                  </Button>
                ) : (
                  <Button
                    onClick={startTimer}
                    size="lg"
                    className={`${getTimerButtonColor()} px-8 py-6 rounded-full shadow-lg animate-btn h-auto`}
                  >
                    <FaPlay className="mr-2.5" size={18} /> Start
                  </Button>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-md ${
                      appSettings.advancedMode
                        ? "border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-700"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <FaRedo size={18} />
                  </Button>

                  <Button
                    onClick={skipTimer}
                    variant="outline"
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-md ${
                      appSettings.advancedMode
                        ? "border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white hover:bg-slate-700"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <FaForward size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats and Settings Column */}
            <div className="w-full lg:w-80">
              <Card className={`modern-card mb-6 shadow-lg ${appSettings.advancedMode ? 'bg-slate-800/90 backdrop-blur-sm border-slate-700/60' : 'bg-white border-gray-200/60'}`}>
                <CardHeader className={`pb-3 ${appSettings.advancedMode ? 'border-slate-700/60' : 'border-gray-100'}`}>
                  <CardTitle className={`flex items-center text-lg ${appSettings.advancedMode ? 'text-white' : ''}`}>
                    <FaChartLine className={`mr-2 ${appSettings.advancedMode ? 'text-blue-400' : 'text-indigo-500'}`} size={16} />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <div className={`space-y-4 ${appSettings.advancedMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <div className="flex justify-between items-center">
                      <span>Current Session:</span>
                      <span className={`font-semibold ${appSettings.advancedMode ? 'text-white' : 'text-gray-800'}`}>{completedPomodoros} pomodoro{completedPomodoros !== 1 && "s"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Today's Focus:</span>
                      <span className={`font-semibold ${appSettings.advancedMode ? 'text-blue-300' : 'text-indigo-600'}`}>{focusMinutesToday} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Weekly total:</span>
                      <span className={`font-semibold ${appSettings.advancedMode ? 'text-white' : 'text-gray-800'}`}>{pomodoroCount} pomodoro{pomodoroCount !== 1 && "s"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>This Week's Focus:</span>
                      <span className={`font-semibold ${appSettings.advancedMode ? 'text-blue-300' : 'text-indigo-600'}`}>{focusMinutesThisWeek} min</span>
                    </div>

                    <div className={`h-px w-full my-2 ${appSettings.advancedMode ? 'bg-slate-700/60' : 'bg-gray-100'}`} />

                    <Button
                      onClick={requestNotificationPermission}
                      variant="outline"
                      size="sm"
                      className={`w-full justify-start ${
                        appSettings.advancedMode
                          ? "border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-700/60"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {notificationsEnabled ? (
                        <>
                          <FaBell className={`mr-2 h-3 w-3 ${appSettings.advancedMode ? 'text-blue-400' : 'text-indigo-500'}`} />
                          Notifications enabled
                        </>
                      ) : (
                        <>
                          <FaBellSlash className={`mr-2 h-3 w-3 ${appSettings.advancedMode ? 'text-blue-400' : 'text-indigo-500'}`} />
                          Enable notifications
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant={appSettings.advancedMode ? "default" : "outline"}
                className={`w-full justify-start mb-4 shadow-md ${
                  appSettings.advancedMode
                    ? "bg-slate-700/90 hover:bg-slate-600/90 text-white border-slate-600/60 backdrop-blur-sm"
                    : "text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <FaCog className="mr-2" /> {showSettings ? "Hide Settings" : "Timer Settings"}
              </Button>

              {showSettings && (
                <div
                  className={`p-6 rounded-xl shadow-lg ${appSettings.advancedMode
                    ? "bg-slate-800/90 border border-slate-700/60 backdrop-blur-sm"
                    : "bg-white shadow-lg border border-gray-200/60"}`}
                >
                  <PomodoroSettings onClose={() => setShowSettings(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
