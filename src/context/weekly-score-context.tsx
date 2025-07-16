import {
  addWeeklyScore,
  getWeeklyScores,
  resetPomodoroCount,
  saveWeeklyScores,
} from "@/lib/storage";
import type { WeeklyScore } from "@/lib/types";
import { createContext, useContext, useEffect, useState } from "react";
import type React from "react";
import { usePomodoroContext } from "./pomodoro-context";
import { useTaskContext } from "./task-context";

interface WeeklyScoreContextType {
  weeklyScores: WeeklyScore[];
  checkWeekEnd: () => void;
  getCurrentWeekNumber: () => number;
  getCurrentYear: () => number;
}

const WeeklyScoreContext = createContext<WeeklyScoreContextType | null>(null);

export const useWeeklyScoreContext = () => {
  const context = useContext(WeeklyScoreContext);
  if (!context) {
    throw new Error(
      "useWeeklyScoreContext must be used within a WeeklyScoreProvider",
    );
  }
  return context;
};

export const WeeklyScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScore[]>([]);
  const [lastCheckedWeek, setLastCheckedWeek] = useState<string>("");
  const { getOverallProgress, uncheckAllTasks } = useTaskContext();
  const { pomodoroCount, setFocusMinutes } = usePomodoroContext();

  // Load weekly scores and lastCheckedWeek from localStorage on initial render
  useEffect(() => {
    setWeeklyScores(getWeeklyScores());
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muslim_task_manager_last_checked_week');
      if (stored) setLastCheckedWeek(stored);
    }
  }, []);

  // Save lastCheckedWeek to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && lastCheckedWeek) {
      localStorage.setItem('muslim_task_manager_last_checked_week', lastCheckedWeek);
    }
  }, [lastCheckedWeek]);

  // Get current ISO week number (1-53)
  const getCurrentWeekNumber = (): number => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7,
    );
  };

  // Get current year
  const getCurrentYear = (): number => {
    return new Date().getFullYear();
  };

  // Check if week has ended (after Friday at 12:00am)
  const checkWeekEnd = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = now.getHours();

    // If it's Saturday (6) and after midnight (which is the start of a new week in this app's context)
    // In JavaScript, 0 = Sunday, so 6 = Saturday
    const isWeekStart = day === 6 && hours >= 0;

    // Create an identifier for the current week
    const currentWeekId = `${getCurrentYear()}-${getCurrentWeekNumber()}`;

    // If it's a new week start and we haven't checked this week yet
    if (isWeekStart) {
      let storedLastCheckedWeek = lastCheckedWeek;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('muslim_task_manager_last_checked_week');
        if (stored) storedLastCheckedWeek = stored;
      }
      if (storedLastCheckedWeek !== currentWeekId) {
        // Save the previous week's score
        const previousWeekNumber = getCurrentWeekNumber() - 1;
        const year = getCurrentYear();

        // Check if a record for the previous week already exists
        const scores = getWeeklyScores();
        const alreadyExists = scores.some(
          (s) => s.weekNumber === previousWeekNumber && s.year === year
        );
        if (!alreadyExists) {
          // Add the score for the previous week
          const newWeeklyScore: WeeklyScore = {
            id: `${year}-${previousWeekNumber}`,
            weekNumber: previousWeekNumber,
            year: year,
            completionPercentage: getOverallProgress(),
            pomodoroCount: pomodoroCount,
            focusMinutes: (typeof window !== 'undefined' && window.localStorage.getItem('muslim_task_manager_focus_minutes')) ? Number(window.localStorage.getItem('muslim_task_manager_focus_minutes')) : 0,
            endDate: new Date().toISOString(),
          };
          addWeeklyScore(newWeeklyScore);
          setWeeklyScores((prevScores) => [...prevScores, newWeeklyScore]);
          // Reset focusMinutes for the new week
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('muslim_task_manager_focus_minutes', '0');
          }
          if (typeof setFocusMinutes === 'function') setFocusMinutes(0);
        }

        // Reset tasks and pomodoro count for the new week
        uncheckAllTasks();
        resetPomodoroCount();

        // Update last checked week
        setLastCheckedWeek(currentWeekId);
      }
    }
  };

  return (
    <WeeklyScoreContext.Provider
      value={{
        weeklyScores,
        checkWeekEnd,
        getCurrentWeekNumber,
        getCurrentYear,
      }}
    >
      {children}
    </WeeklyScoreContext.Provider>
  );
};
