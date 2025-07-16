import type { Note, Project, Task, WeeklyScore } from "./types";

// Tasks Storage
const TASKS_STORAGE_KEY = "muslim_task_manager_tasks";

export const getTasks = (): Task[] => {
  if (typeof window === "undefined") return [];

  const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!tasksJson) return [];

  try {
    return JSON.parse(tasksJson);
  } catch (error) {
    console.error("Failed to parse tasks from localStorage", error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

// Projects Storage
const PROJECTS_STORAGE_KEY = "muslim_task_manager_projects";

export const getProjects = (): Project[] => {
  if (typeof window === "undefined") return [];

  const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!projectsJson) return [];

  try {
    return JSON.parse(projectsJson);
  } catch (error) {
    console.error("Failed to parse projects from localStorage", error);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

// Notes Storage
const NOTES_STORAGE_KEY = "muslim_task_manager_notes";

interface RawNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getNotes = (): Note[] => {
  if (typeof window === "undefined") return [];

  const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
  if (!notesJson) return [];

  try {
    const parsed = JSON.parse(notesJson) as RawNote[];
    // Convert string dates to Date objects
    return parsed.map((note: RawNote) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  } catch (error) {
    console.error("Failed to parse notes from localStorage", error);
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
};

// Pomodoro Settings Storage
export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
};

const POMODORO_SETTINGS_KEY = "muslim_task_manager_pomodoro_settings";

export const getPomodoroSettings = (): PomodoroSettings => {
  if (typeof window === "undefined") return DEFAULT_POMODORO_SETTINGS;

  const settingsJson = localStorage.getItem(POMODORO_SETTINGS_KEY);
  if (!settingsJson) return DEFAULT_POMODORO_SETTINGS;

  try {
    return { ...DEFAULT_POMODORO_SETTINGS, ...JSON.parse(settingsJson) };
  } catch (error) {
    console.error("Failed to parse pomodoro settings from localStorage", error);
    return DEFAULT_POMODORO_SETTINGS;
  }
};

export const savePomodoroSettings = (settings: PomodoroSettings): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(settings));
};

// Pomodoro Count Storage
const POMODORO_COUNT_KEY = "muslim_task_manager_pomodoro_count";

export const getPomodoroCount = (): number => {
  if (typeof window === "undefined") return 0;

  const countJson = localStorage.getItem(POMODORO_COUNT_KEY);
  if (!countJson) return 0;

  try {
    return JSON.parse(countJson);
  } catch (error) {
    console.error("Failed to parse pomodoro count from localStorage", error);
    return 0;
  }
};

export const savePomodoroCount = (count: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(POMODORO_COUNT_KEY, JSON.stringify(count));
};

export const resetPomodoroCount = (): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(POMODORO_COUNT_KEY, JSON.stringify(0));
};

// Weekly Scores Storage
const WEEKLY_SCORES_KEY = "muslim_task_manager_weekly_scores";

export const getWeeklyScores = (): WeeklyScore[] => {
  if (typeof window === "undefined") return [];

  const scoresJson = localStorage.getItem(WEEKLY_SCORES_KEY);
  if (!scoresJson) return [];

  try {
    return JSON.parse(scoresJson);
  } catch (error) {
    console.error("Failed to parse weekly scores from localStorage", error);
    return [];
  }
};

export const saveWeeklyScores = (scores: WeeklyScore[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEEKLY_SCORES_KEY, JSON.stringify(scores));
};

export const addWeeklyScore = (score: WeeklyScore): void => {
  const scores = getWeeklyScores();
  // Prevent duplicate for the same week and year
  const exists = scores.some(
    (s) => s.weekNumber === score.weekNumber && s.year === score.year
  );
  if (!exists) {
    scores.push(score);
    saveWeeklyScores(scores);
  }
};

// Timer State Storage
interface TimerState {
  isRunning: boolean;
  timerType: "work" | "shortBreak" | "longBreak";
  timeLeft: number;
  completedPomodoros: number;
  endTime: number | null;
  lastUpdated: number;
}

const DEFAULT_TIMER_STATE: TimerState = {
  isRunning: false,
  timerType: "work",
  timeLeft: 1500, // 25 minutes in seconds
  completedPomodoros: 0,
  endTime: null,
  lastUpdated: Date.now(),
};

const TIMER_STATE_KEY = "muslim_task_manager_timer_state";

export const getTimerState = (): TimerState => {
  if (typeof window === "undefined") return DEFAULT_TIMER_STATE;

  const stateJson = localStorage.getItem(TIMER_STATE_KEY);
  if (!stateJson) return DEFAULT_TIMER_STATE;

  try {
    const savedState = JSON.parse(stateJson) as TimerState;

    // If the timer was running when saved, calculate remaining time
    if (savedState.isRunning && savedState.endTime) {
      const elapsed = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
      savedState.timeLeft = Math.max(0, savedState.timeLeft - elapsed);

      // If timer has completed while away, reset it to not running
      if (savedState.timeLeft <= 0) {
        savedState.isRunning = false;
        savedState.endTime = null;

        // If it was a work session, increment completed pomodoros
        if (savedState.timerType === "work") {
          savedState.completedPomodoros += 1;

          // Determine next break type
          const settings = getPomodoroSettings();
          if (
            savedState.completedPomodoros % settings.longBreakInterval ===
            0
          ) {
            savedState.timerType = "longBreak";
            savedState.timeLeft = settings.longBreakDuration * 60;
          } else {
            savedState.timerType = "shortBreak";
            savedState.timeLeft = settings.shortBreakDuration * 60;
          }
        } else {
          // If it was a break, next should be work
          savedState.timerType = "work";
          savedState.timeLeft = getPomodoroSettings().workDuration * 60;
        }
      }
    }

    savedState.lastUpdated = Date.now();
    return savedState;
  } catch (error) {
    console.error("Failed to parse timer state from localStorage", error);
    return DEFAULT_TIMER_STATE;
  }
};

export const saveTimerState = (
  state: Omit<TimerState, "lastUpdated">,
): void => {
  if (typeof window === "undefined") return;

  const stateWithTimestamp = {
    ...state,
    lastUpdated: Date.now(),
  };

  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(stateWithTimestamp));
};
