"use client";

import { useAppSettings } from "@/context/app-settings-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaBook, FaList, FaNotesMedical, FaRegClock, FaRegStickyNote } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AzanTimes from "@/components/azan/azan-times";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaChartLine,
  FaClock,
  FaCog,
  FaPray,
  FaStickyNote,
} from "react-icons/fa";
import SidebarTimerIndicator from "./sidebar-timer-indicator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, toggleAdvancedMode } = useAppSettings();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Hydration fix: only render shimmer after client hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Header height stays at 45px but logo is bigger and text is smaller
  const headerHeight = "45px";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with app title and Azan times */}
      <header
        className="w-full fixed top-0 z-50 backdrop-blur-md bg-opacity-80 border-b border-white/10"
        style={{ height: headerHeight }}
      >
        <div
          className={`h-full page-header py-0.5 px-4 flex justify-between items-center shadow-lg relative overflow-hidden ${
            settings.advancedMode
              ? "bg-gradient-to-r from-slate-800/90 to-slate-900/90 before:animate-gradient-shimmer" // shimmer via ::before
              : "bg-gradient-to-r from-indigo-400/80 to-purple-500/80"
          }`}
        >
          {/* Animated shimmer for advanced mode, only after hydration */}
          {settings.advancedMode && hydrated && (
            <div className="absolute inset-0 pointer-events-none animate-gradient-shimmer bg-gradient-to-r from-blue-900/10 via-transparent to-blue-900/10 opacity-40" />
          )}
          <div className="flex items-center space-x-3 z-10">
            <Image
              src="/images/logo.png"
              alt="Muslim Task Manager"
              width={42}
              height={42}
              className="rounded-full shadow-xl border border-white/10"
            />
            <div>
              <h1 className="text-[16px] font-bold text-white drop-shadow-md">
                Muslim Task Manager
              </h1>
              <div className="text-white text-[10px] opacity-95 drop-shadow-sm">
                Organize your day with purpose
              </div>
            </div>
          </div>
          {/* Azan times integrated into the header */}
          <AzanTimes />
        </div>
      </header>

      {/* Main content area with improved spacing */}
      <div className="flex min-h-screen pt-[45px]">
        {/* Sidebar with improved styling and animation */}
        {hydrated && (
          <div
            className={`sidebar w-20 sticky left-0 top-[45px] h-[calc(100vh-45px)] z-20 shadow-xl transition-all duration-300 ease-in-out border-r ${
              settings.advancedMode
                ? "bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950/95 before:animate-gradient-shimmer border-white/10"
                : "bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-500 border-gray-300"
            } relative overflow-hidden`}
          >
            {/* Animated shimmer for advanced mode, only after hydration */}
            {settings.advancedMode && hydrated && (
              <div className="absolute inset-0 pointer-events-none animate-gradient-shimmer bg-gradient-to-b from-blue-900/10 via-transparent to-blue-900/10 opacity-30" />
            )}
            {/* Increased empty space at the top of sidebar */}
            <div className="mt-16"></div>

            <div className="flex flex-col items-center space-y-6 z-10">
              <Link href="/" className="flex flex-col items-center">
                <button
                  data-tutorial-id="sidebar-tasks"
                  className={`sidebar-btn w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center transition-all duration-200 relative group ${
                      pathname === "/"
                        ? settings.advancedMode
                          ? "bg-blue-600/30 shadow-lg scale-110 border border-blue-500/30 shadow-blue-500/20 ring-2 ring-blue-400/40 text-white"
                          : "bg-indigo-700 text-white shadow-lg scale-110 border border-indigo-800 ring-2 ring-indigo-400"
                        : settings.advancedMode
                          ? "hover:bg-slate-700/80 hover:shadow-md hover:scale-105 hover:border hover:border-blue-500/20 text-white"
                          : "bg-indigo-100 text-indigo-900 hover:bg-indigo-600 hover:text-white border border-transparent hover:border-indigo-700"
                  }`}
                  aria-label="Task Manager"
                >
                  <FaList
                    size={20}
                    className={
                      pathname === "/" && settings.advancedMode
                        ? "text-blue-400 drop-shadow"
                        : pathname === "/" && !settings.advancedMode
                          ? "text-white"
                          : ""
                    }
                  />
                  {settings.advancedMode && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-blue-400/40 opacity-0 group-hover:opacity-80 transition-all duration-200" />
                  )}
                </button>
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    pathname === "/"
                      ? settings.advancedMode
                        ? "text-blue-400"
                        : "text-indigo-900"
                      : settings.advancedMode
                        ? "text-white/70 hover:text-blue-400"
                        : "text-indigo-700 hover:text-indigo-900"
                  }`}
                >
                  Tasks
                </span>
              </Link>

              {/* Improved other navigation items */}
              <Link href="/pomodoro" className="flex flex-col items-center">
                <button
                  className={`sidebar-btn w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center text-white transition-all duration-200 ${
                      pathname === "/pomodoro"
                        ? settings.advancedMode
                          ? "bg-purple-600/30 shadow-lg scale-110 border border-purple-500/30 shadow-purple-500/20"
                          : "bg-white/20 shadow-lg scale-110 border border-white/20"
                        : settings.advancedMode
                          ? "hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-purple-500/20"
                          : "hover:bg-white/10 hover:scale-105"
                  }`}
                  aria-label="Pomodoro Timer"
                >
                  <FaClock
                    size={20}
                    className={
                      pathname === "/pomodoro" && settings.advancedMode
                        ? "text-purple-400"
                        : ""
                    }
                  />
                </button>
                <span
                  className={`text-white text-xs font-medium transition-all duration-200 ${
                    pathname === "/pomodoro"
                      ? settings.advancedMode
                        ? "text-purple-400"
                        : "text-indigo-700"
                      : settings.advancedMode
                        ? "text-white/70 hover:text-purple-400"
                        : "text-indigo-500 hover:text-indigo-700"
                  }`}
                >
                  Pomodoro
                </span>
              </Link>

              <Link href="/worship-tasks" className="flex flex-col items-center">
                <button
                  className={`sidebar-btn w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center text-white transition-all duration-200 ${
                      pathname === "/worship-tasks"
                        ? settings.advancedMode
                          ? "bg-green-600/30 shadow-lg scale-110 border border-green-500/30 shadow-green-500/20"
                          : "bg-white/20 shadow-lg scale-110 border border-white/20"
                        : settings.advancedMode
                          ? "hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-green-500/20"
                          : "hover:bg-white/10 hover:scale-105"
                  }`}
                  aria-label="Muslim's Worship Tasks"
                >
                  <FaPray
                    size={20}
                    className={
                      pathname === "/worship-tasks" && settings.advancedMode
                        ? "text-green-400"
                        : ""
                    }
                  />
                </button>
                <span
                  className={`text-white text-xs font-medium transition-all duration-200 ${
                    pathname === "/worship-tasks"
                      ? settings.advancedMode
                        ? "text-green-400"
                        : "text-indigo-700"
                      : settings.advancedMode
                        ? "text-white/70 hover:text-green-400"
                        : "text-indigo-500 hover:text-indigo-700"
                  }`}
                >
                  Worship
                </span>
              </Link>

              <Link href="/notes" className="flex flex-col items-center">
                <button
                  className={`sidebar-btn w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center text-white transition-all duration-200 ${
                      pathname === "/notes"
                        ? settings.advancedMode
                          ? "bg-amber-600/30 shadow-lg scale-110 border border-amber-500/30 shadow-amber-500/20"
                          : "bg-white/20 shadow-lg scale-110 border border-white/20"
                        : settings.advancedMode
                          ? "hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-amber-500/20"
                          : "hover:bg-white/10 hover:scale-105"
                  }`}
                  aria-label="Notes"
                >
                  <FaStickyNote
                    size={20}
                    className={
                      pathname === "/notes" && settings.advancedMode
                        ? "text-amber-400"
                        : ""
                    }
                  />
                </button>
                <span
                  className={`text-white text-xs font-medium transition-all duration-200 ${
                    pathname === "/notes"
                      ? settings.advancedMode
                        ? "text-amber-400"
                        : "text-indigo-700"
                      : settings.advancedMode
                        ? "text-white/70 hover:text-amber-400"
                        : "text-indigo-500 hover:text-indigo-700"
                  }`}
                >
                  Notes
                </span>
              </Link>

              <Link href="/mithaq" className="flex flex-col items-center">
                <button
                  className={`sidebar-btn w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center text-white transition-all duration-200 ${
                      pathname === "/mithaq"
                        ? settings.advancedMode
                          ? "bg-cyan-600/30 shadow-lg scale-110 border border-cyan-500/30 shadow-cyan-500/20"
                          : "bg-white/20 shadow-lg scale-110 border border-white/20"
                        : settings.advancedMode
                          ? "hover:bg-slate-800 hover:shadow-md hover:scale-105 hover:border hover:border-cyan-500/20"
                          : "hover:bg-white/10 hover:scale-105"
                  }`}
                  aria-label="Mithaq Al-Tatwir"
                >
                  <FaChartLine
                    size={20}
                    className={
                      pathname === "/mithaq" && settings.advancedMode
                        ? "text-cyan-400"
                        : ""
                    }
                  />
                </button>
                <span
                  className={`text-white text-xs font-medium transition-all duration-200 ${
                    pathname === "/mithaq"
                      ? settings.advancedMode
                        ? "text-cyan-400"
                        : "text-indigo-700"
                      : settings.advancedMode
                        ? "text-white/70 hover:text-cyan-400"
                        : "text-indigo-500 hover:text-indigo-700"
                  }`}
                >
                  Mithaq
                </span>
              </Link>

              {/* Mode Toggle with text */}
              <div className="flex flex-col items-center mt-8">
                <button
                  onClick={toggleAdvancedMode}
                  className={`sidebar-btn w-12 h-12 rounded-xl mb-1.5 flex items-center justify-center text-white transition-all duration-300 ${
                    settings.advancedMode
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg scale-110 border border-blue-400/30"
                      : "hover:bg-white/10 hover:scale-105"
                  }`}
                  aria-label="Toggle Advanced Mode"
                >
                  <FaCog
                    size={20}
                    className={
                      settings.advancedMode ? "animate-spin-slow text-white" : ""
                    }
                  />
                </button>
                <span className={`text-white text-[9px] font-medium ${settings.advancedMode ? "text-blue-300" : "text-white/70"}`}>
                  {settings.advancedMode ? "Advanced" : "Basic"}
                </span>
              </div>
            </div>
            {/* Divider before mode toggle/timer */}
            <div className="w-10 mx-auto my-6 border-t border-white/10" />
            {/* Timer Indicator that shows when a timer is running */}
            <SidebarTimerIndicator />
          </div>
        )}

        {/* Main Content with improved aesthetics */}
        <main
          className={`flex-1 min-h-screen transition-colors duration-300 ${
            settings.advancedMode
              ? "bg-gradient-to-b from-slate-900 to-slate-950 text-white"
              : "bg-gray-50"
          }`}
        >
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
