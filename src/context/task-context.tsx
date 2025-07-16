import { getTasks, saveTasks } from "@/lib/storage";
import {
  type DayOfWeek,
  EffortWeights,
  type Priority,
  type SubTask,
  type Task,
} from "@/lib/types";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePomodoroContext } from "./pomodoro-context";

interface TaskContextType {
  tasks: Task[];
  addTask: (
    title: string,
    day: DayOfWeek,
    priority: Priority,
    pomodoroEstimate?: number,
    projectId?: string,
  ) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, "id">>) => void;
  copyTasks: (taskIds: string[], targetDay: DayOfWeek) => void;
  uncheckAllTasks: () => void;
  sortTasks: () => void;
  getTasksByDay: (day: DayOfWeek) => Task[];
  getDayProgress: (day: DayOfWeek) => number;
  getOverallProgress: () => number;
  selectedTasks: string[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectTask: (taskId: string, selected: boolean) => void;
  addSubtask: (taskId: string, subtaskTitle: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  editSubtask: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  setCurrentPomodoroTask: (taskId: string) => void;
  clearCurrentPomodoroTask: () => void;
  incrementTaskPomodoro: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    // Load tasks from localStorage on initial render
    const savedTasks = getTasks();
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (
    title: string,
    day: DayOfWeek,
    priority: Priority,
    pomodoroEstimate?: number,
    projectId?: string,
  ) => {
    if (!title.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      day,
      priority,
      completed: false,
      subtasks: [],
      pomodoroEstimate,
      pomodorosCompleted: 0,
      currentPomodoroTask: false,
      projectId,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success("Task added successfully");
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== id) return task;

        // If toggling to complete and the task has subtasks, also mark all subtasks as completed
        if (!task.completed && task.subtasks && task.subtasks.length > 0) {
          const allSubtasksComplete = task.subtasks.every(
            (subtask) => subtask.completed,
          );
          if (!allSubtasksComplete) {
            return {
              ...task,
              completed: true,
              subtasks: task.subtasks.map((subtask) => ({
                ...subtask,
                completed: true,
              })),
            };
          }
        }

        return { ...task, completed: !task.completed };
      }),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    toast.success("Task deleted");
  };

  const editTask = (id: string, updates: Partial<Omit<Task, "id">>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    );
    toast.success("Task updated");
  };

  const copyTasks = (taskIds: string[], targetDay: DayOfWeek) => {
    const tasksToCopy = tasks.filter((task) => taskIds.includes(task.id));

    const newTasks = tasksToCopy.map((task) => ({
      ...task,
      id: Date.now() + Math.random().toString(),
      day: targetDay,
    }));

    setTasks((prevTasks) => [...prevTasks, ...newTasks]);
    toast.success(`${newTasks.length} task(s) copied to ${targetDay}`);
  };

  const uncheckAllTasks = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        // Uncheck the task and all subtasks
        if (task.subtasks && task.subtasks.length > 0) {
          return {
            ...task,
            completed: false,
            subtasks: task.subtasks.map((subtask) => ({
              ...subtask,
              completed: false,
            })),
          };
        }
        return { ...task, completed: false };
      }),
    );
    toast.success("All tasks unchecked");
  };

  const sortTasks = () => {
    setTasks((prevTasks) => {
      const priorityOrder: Record<Priority, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };

      return [...prevTasks].sort((a, b) => {
        // First sort by priority
        const priorityDiff =
          priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Then by completion status (incomplete first)
        if (a.completed !== b.completed) return a.completed ? 1 : -1;

        // Then by current pomodoro task (current first)
        if (a.currentPomodoroTask !== b.currentPomodoroTask) {
          return a.currentPomodoroTask ? -1 : 1;
        }

        // Finally by title
        return a.title.localeCompare(b.title);
      });
    });

    toast.success("Tasks sorted by priority");
  };

  const getTasksByDay = (day: DayOfWeek): Task[] => {
    const dayTasks = tasks.filter((task) => task.day === day);
    // Sort tasks: uncompleted first, then completed
    return dayTasks.sort((a, b) => {
      // First, sort by completion status (incomplete first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // If both tasks have the same completion status, sort by priority
      const priorityOrder: Record<Priority, number> = {
        high: 1,
        medium: 2,
        low: 3,
      };

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Calculate progress based on weighted effort
  const getDayProgress = (day: DayOfWeek): number => {
    const dayTasks = getTasksByDay(day);
    if (dayTasks.length === 0) return 100;

    // Calculate weighted totals
    let totalWeight = 0;
    let completedWeight = 0;

    for (const task of dayTasks) {
      const taskWeight = EffortWeights[task.priority];
      totalWeight += taskWeight;

      if (task.completed) {
        completedWeight += taskWeight;
      }
    }

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const getOverallProgress = (): number => {
    if (tasks.length === 0) return 100;

    // Calculate weighted totals for all tasks
    let totalWeight = 0;
    let completedWeight = 0;

    for (const task of tasks) {
      const taskWeight = EffortWeights[task.priority];
      totalWeight += taskWeight;

      if (task.completed) {
        completedWeight += taskWeight;
      }
    }

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const toggleSelectTask = (taskId: string, selected: boolean) => {
    setSelectedTasks((prev) =>
      selected ? [...prev, taskId] : prev.filter((id) => id !== taskId),
    );
  };

  // Subtasks management
  const addSubtask = (taskId: string, subtaskTitle: string) => {
    if (!subtaskTitle.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }

    const newSubtask: SubTask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: subtaskTitle.trim(),
      completed: false,
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const subtasks = task.subtasks || [];
          return {
            ...task,
            subtasks: [...subtasks, newSubtask],
          };
        }
        return task;
      }),
    );
    toast.success("Subtask added successfully");
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId || !task.subtasks) return task;

        const updatedSubtasks = task.subtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask,
        );

        // Find the subtask that was toggled
        const toggledSubtask = updatedSubtasks.find(
          (subtask) => subtask.id === subtaskId,
        );

        // If we're unchecking a subtask, the parent task should also be unchecked
        const shouldUncheckParent = toggledSubtask && !toggledSubtask.completed;

        // Check if all subtasks are completed (used when checking a subtask)
        const allSubtasksComplete = updatedSubtasks.every(
          (subtask) => subtask.completed,
        );

        // Update the parent task completed status:
        // - If unchecking a subtask: always uncheck the parent
        // - If checking a subtask: check the parent only if all subtasks are complete
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: shouldUncheckParent
            ? false
            : allSubtasksComplete
              ? true
              : task.completed,
        };
      }),
    );
  };

  const editSubtask = (taskId: string, subtaskId: string, title: string) => {
    if (!title.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId || !task.subtasks) return task;

        return {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, title: title.trim() }
              : subtask,
          ),
        };
      }),
    );
    toast.success("Subtask updated");
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId || !task.subtasks) return task;

        return {
          ...task,
          subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
        };
      }),
    );
    toast.success("Subtask deleted");
  };

  // Pomodoro task management
  const setCurrentPomodoroTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({
        ...task,
        currentPomodoroTask: task.id === taskId,
      })),
    );
    toast.success("Current pomodoro task set");
  };

  const clearCurrentPomodoroTask = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({
        ...task,
        currentPomodoroTask: false,
      })),
    );
  };

  const incrementTaskPomodoro = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;

        const pomodorosCompleted = (task.pomodorosCompleted || 0) + 1;
        const pomodoroEstimate = task.pomodoroEstimate || 0;

        // If the task has a pomodoro estimate and we've completed it, mark the task as done
        let completed = task.completed;
        if (pomodoroEstimate > 0 && pomodorosCompleted >= pomodoroEstimate) {
          completed = true;
        }

        return {
          ...task,
          pomodorosCompleted,
          completed,
        };
      }),
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        editTask,
        copyTasks,
        uncheckAllTasks,
        sortTasks,
        getTasksByDay,
        getDayProgress,
        getOverallProgress,
        selectedTasks,
        setSelectedTasks,
        toggleSelectTask,
        addSubtask,
        toggleSubtask,
        editSubtask,
        deleteSubtask,
        setCurrentPomodoroTask,
        clearCurrentPomodoroTask,
        incrementTaskPomodoro,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
