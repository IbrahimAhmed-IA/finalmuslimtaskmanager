"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSettings } from "@/context/app-settings-context";
import { useTaskContext } from "@/context/task-context";
import type { DayOfWeek, Task } from "@/lib/types";
import { useState } from "react";
import { toast } from "sonner";

interface RepeatTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskIds: string[];
  onTasksRepeated: () => void;
}

export default function RepeatTaskModal({
  isOpen,
  onClose,
  taskIds,
  onTasksRepeated,
}: RepeatTaskModalProps) {
  const { copyTasks, tasks } = useTaskContext();
  const { settings } = useAppSettings();
  const [repeatOption, setRepeatOption] = useState<
    "tomorrow" | "all" | "custom"
  >("tomorrow");
  const [customDays, setCustomDays] = useState<DayOfWeek[]>([]);

  // Get tomorrow's day
  const getTomorrowDay = (): DayOfWeek => {
    const daysOfWeek: DayOfWeek[] = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = new Date();
    const tomorrowIndex = (today.getDay() + 1) % 7;
    return daysOfWeek[tomorrowIndex];
  };

  const allDays: DayOfWeek[] = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];
  const tomorrow = getTomorrowDay();

  // Define consistent styles for the advanced mode
  const advancedStyles = settings.advancedMode
    ? {
        background: "bg-slate-800",
        text: "text-white",
        border: "border-slate-700",
        label: "text-slate-200",
        inputBg: "bg-slate-700",
        inputBorder: "border-slate-600",
        buttonPrimary: "bg-blue-600 hover:bg-blue-700",
        buttonSecondary:
          "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
      }
    : {};

  const handleToggleCustomDay = (day: DayOfWeek) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleRepeat = () => {
    // If no task IDs are provided (when using the general repeat button),
    // we need to use existing tasks as template tasks to repeat
    const tasksToRepeat =
      taskIds.length > 0
        ? taskIds
        : tasks
            .filter((task) => !task.completed)
            .slice(0, 5)
            .map((task) => task.id);

    if (tasksToRepeat.length === 0) {
      toast.error(
        "No tasks found to repeat. Please create at least one task first.",
      );
      return;
    }

    if (repeatOption === "tomorrow") {
      copyTasks(tasksToRepeat, tomorrow);
      toast.success(
        `Task${tasksToRepeat.length > 1 ? "s" : ""} repeated for tomorrow (${tomorrow})`,
      );
    } else if (repeatOption === "all") {
      // Copy to all days
      for (const day of allDays) {
        copyTasks(tasksToRepeat, day);
      }
      toast.success(
        `Task${tasksToRepeat.length > 1 ? "s" : ""} repeated for all days of the week`,
      );
    } else if (repeatOption === "custom" && customDays.length > 0) {
      // Copy to selected custom days
      for (const day of customDays) {
        copyTasks(tasksToRepeat, day);
      }
      toast.success(
        `Task${tasksToRepeat.length > 1 ? "s" : ""} repeated for ${customDays.length} selected days`,
      );
    }

    onTasksRepeated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`sm:max-w-[425px] ${advancedStyles.background} ${advancedStyles.text} ${advancedStyles.border}`}
      >
        <DialogHeader>
          <DialogTitle className={settings.advancedMode ? "text-white" : ""}>
            Repeat Tasks
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label
              className={`text-sm font-medium ${settings.advancedMode ? advancedStyles.label : ""}`}
            >
              Repeat Options
            </label>

            <div
              className={`space-y-3 p-3 rounded-md ${settings.advancedMode ? "bg-slate-700/50" : "bg-gray-50"}`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="tomorrow"
                  checked={repeatOption === "tomorrow"}
                  onChange={() => setRepeatOption("tomorrow")}
                  className={`${settings.advancedMode ? "accent-blue-400" : ""}`}
                />
                <label
                  htmlFor="tomorrow"
                  className={`text-sm ${settings.advancedMode ? "text-slate-200" : ""} capitalize`}
                >
                  Tomorrow ({tomorrow})
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="all-days"
                  checked={repeatOption === "all"}
                  onChange={() => setRepeatOption("all")}
                  className={`${settings.advancedMode ? "accent-blue-400" : ""}`}
                />
                <label
                  htmlFor="all-days"
                  className={`text-sm ${settings.advancedMode ? "text-slate-200" : ""}`}
                >
                  All days of the week
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-days"
                  checked={repeatOption === "custom"}
                  onChange={() => setRepeatOption("custom")}
                  className={`${settings.advancedMode ? "accent-blue-400" : ""}`}
                />
                <label
                  htmlFor="custom-days"
                  className={`text-sm ${settings.advancedMode ? "text-slate-200" : ""}`}
                >
                  Custom days
                </label>
              </div>

              {repeatOption === "custom" && (
                <div
                  className={`p-3 mt-2 grid grid-cols-1 gap-2 rounded-md ${settings.advancedMode ? "bg-slate-600/50" : "bg-gray-100"}`}
                >
                  {allDays.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={customDays.includes(day)}
                        onCheckedChange={() => handleToggleCustomDay(day)}
                        className={settings.advancedMode ? "text-blue-400" : ""}
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className={`text-sm capitalize ${settings.advancedMode ? "text-slate-200" : ""}`}
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={settings.advancedMode ? advancedStyles.buttonSecondary : ""}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleRepeat}
            disabled={repeatOption === "custom" && customDays.length === 0}
            className={settings.advancedMode ? advancedStyles.buttonPrimary : ""}
          >
            Repeat Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
