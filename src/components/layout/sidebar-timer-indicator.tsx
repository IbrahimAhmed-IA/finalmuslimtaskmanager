"use client";

import { usePomodoroContext } from "@/context/pomodoro-context";
import Link from "next/link";
import React from "react";
import { FaClock } from "react-icons/fa";

export default function SidebarTimerIndicator() {
  const { isRunning, timerType, timeLeft } = usePomodoroContext();

  // Don't show indicator if timer is not running
  if (!isRunning) {
    return null;
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get color based on timer type
  const getTimerColor = () => {
    switch (timerType) {
      case "work":
        return "bg-purple-600";
      case "shortBreak":
        return "bg-green-500";
      case "longBreak":
        return "bg-blue-500";
      default:
        return "bg-purple-600";
    }
  };

  return (
    <Link
      href="/pomodoro"
      className="absolute bottom-10 left-0 w-full flex flex-col items-center"
    >
      <div
        className={`w-16 h-16 rounded-full ${getTimerColor()} flex items-center justify-center mx-auto shadow-lg animate-pulse`}
      >
        <div className="flex flex-col items-center">
          <FaClock className="text-white mb-1" />
          <span className="text-white text-xs font-mono">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      <span className="text-white/70 text-xs mt-1">Running</span>
    </Link>
  );
}
