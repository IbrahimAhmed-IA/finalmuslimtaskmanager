import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/context/app-settings-context";
import { usePomodoroContext } from "@/context/pomodoro-context";
import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

interface PomodoroSettingsProps {
  onClose: () => void;
}

export default function PomodoroSettings({ onClose }: PomodoroSettingsProps) {
  const { settings, updateSettings, timerType } = usePomodoroContext();
  const { settings: appSettings } = useAppSettings();

  const [workDuration, setWorkDuration] = useState(settings.workDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(
    settings.shortBreakDuration,
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    settings.longBreakDuration,
  );
  const [longBreakInterval, setLongBreakInterval] = useState(
    settings.longBreakInterval,
  );
  const [autoStartBreaks, setAutoStartBreaks] = useState(
    settings.autoStartBreaks,
  );
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(
    settings.autoStartPomodoros,
  );

  const handleSubmit = () => {
    updateSettings({
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      longBreakInterval,
      autoStartBreaks,
      autoStartPomodoros,
    });

    onClose();
  };

  // Get border color based on timer type
  const getBorderColor = () => {
    if (appSettings.advancedMode) {
      switch (timerType) {
        case "work":
          return "border-indigo-600";
        case "shortBreak":
          return "border-teal-600";
        case "longBreak":
          return "border-blue-600";
      }
    }

    switch (timerType) {
      case "work":
        return "border-purple-500";
      case "shortBreak":
        return "border-green-500";
      case "longBreak":
        return "border-blue-500";
    }
  };

  // Get header background color based on timer type
  const getHeaderBgColor = () => {
    if (appSettings.advancedMode) {
      switch (timerType) {
        case "work":
          return "bg-indigo-900 text-white";
        case "shortBreak":
          return "bg-teal-900 text-white";
        case "longBreak":
          return "bg-blue-900 text-white";
      }
    }

    switch (timerType) {
      case "work":
        return "bg-purple-50 text-purple-700";
      case "shortBreak":
        return "bg-green-50 text-green-700";
      case "longBreak":
        return "bg-blue-50 text-blue-700";
    }
  };

  // Get button background color based on timer type
  const getButtonBgColor = () => {
    if (appSettings.advancedMode) {
      switch (timerType) {
        case "work":
          return "bg-indigo-600 hover:bg-indigo-700";
        case "shortBreak":
          return "bg-teal-600 hover:bg-teal-700";
        case "longBreak":
          return "bg-blue-600 hover:bg-blue-700";
      }
    }

    switch (timerType) {
      case "work":
        return "bg-purple-600 hover:bg-purple-700";
      case "shortBreak":
        return "bg-green-500 hover:bg-green-600";
      case "longBreak":
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <div className="w-full">
      <CardHeader className={`${getHeaderBgColor()} rounded-t-lg`}>
        <CardTitle className="flex items-center justify-between">
          <span>Timer Settings</span>
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white"
            aria-label="Close settings"
          >
            <FaTimes />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent
        className={`p-6 ${appSettings.advancedMode ? "text-white" : ""}`}
      >
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="work-duration"
                className={`text-sm font-medium ${appSettings.advancedMode ? "text-slate-300" : ""}`}
              >
                Focus Duration (minutes)
              </label>
              <Input
                id="work-duration"
                type="number"
                min={1}
                max={60}
                value={workDuration}
                onChange={(e) =>
                  setWorkDuration(Number.parseInt(e.target.value) || 1)
                }
                className={
                  appSettings.advancedMode
                    ? "bg-slate-700 border-slate-600 text-white focus:border-indigo-500"
                    : "border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200"
                }
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="short-break-duration"
                className={`text-sm font-medium ${appSettings.advancedMode ? "text-slate-300" : ""}`}
              >
                Short Break Duration (minutes)
              </label>
              <Input
                id="short-break-duration"
                type="number"
                min={1}
                max={30}
                value={shortBreakDuration}
                onChange={(e) =>
                  setShortBreakDuration(Number.parseInt(e.target.value) || 1)
                }
                className={
                  appSettings.advancedMode
                    ? "bg-slate-700 border-slate-600 text-white focus:border-teal-500"
                    : "border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="long-break-duration"
                className={`text-sm font-medium ${appSettings.advancedMode ? "text-slate-300" : ""}`}
              >
                Long Break Duration (minutes)
              </label>
              <Input
                id="long-break-duration"
                type="number"
                min={1}
                max={60}
                value={longBreakDuration}
                onChange={(e) =>
                  setLongBreakDuration(Number.parseInt(e.target.value) || 1)
                }
                className={
                  appSettings.advancedMode
                    ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                }
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="long-break-interval"
                className={`text-sm font-medium ${appSettings.advancedMode ? "text-slate-300" : ""}`}
              >
                Long Break Interval (pomodoros)
              </label>
              <Input
                id="long-break-interval"
                type="number"
                min={1}
                max={10}
                value={longBreakInterval}
                onChange={(e) =>
                  setLongBreakInterval(Number.parseInt(e.target.value) || 1)
                }
                className={
                  appSettings.advancedMode
                    ? "bg-slate-700 border-slate-600 text-white focus:border-slate-400"
                    : "border-gray-300 focus:border-gray-500 focus:ring focus:ring-gray-200"
                }
              />
            </div>
          </div>

          <div
            className={`${appSettings.advancedMode ? "bg-slate-700" : "bg-gray-50"} p-4 rounded-lg space-y-4`}
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                id="auto-start-breaks"
                checked={autoStartBreaks}
                onCheckedChange={(checked) => setAutoStartBreaks(!!checked)}
                className={`${appSettings.advancedMode ? "text-indigo-400 border-slate-500" : "text-purple-600 focus:ring-purple-500"}`}
              />
              <label
                htmlFor="auto-start-breaks"
                className={`text-sm font-medium cursor-pointer ${appSettings.advancedMode ? "text-slate-300" : ""}`}
              >
                Auto-start breaks when focus time ends
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="auto-start-pomodoros"
                checked={autoStartPomodoros}
                onCheckedChange={(checked) => setAutoStartPomodoros(!!checked)}
                className={`${appSettings.advancedMode ? "text-indigo-400 border-slate-500" : "text-purple-600 focus:ring-purple-500"}`}
              />
              <label
                htmlFor="auto-start-pomodoros"
                className={`text-sm font-medium cursor-pointer ${appSettings.advancedMode ? "text-slate-300" : ""}`}
              >
                Auto-start focus timer when break ends
              </label>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={`flex justify-end gap-2 p-4 ${appSettings.advancedMode ? "bg-slate-900 border-t border-slate-700" : "bg-gray-50 border-t"}`}
      >
        <Button
          variant="outline"
          onClick={onClose}
          size="sm"
          className={`px-3 py-1 h-8 ${
            appSettings.advancedMode
              ? "border-slate-600 text-white hover:bg-slate-700"
              : "border-gray-300"
          }`}
        >
          <FaTimes className="mr-1.5 h-3 w-3" /> Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          size="sm"
          className={`${getButtonBgColor()} text-white px-3 py-1 h-8`}
        >
          <FaSave className="mr-1.5 h-3 w-3" /> Save Settings
        </Button>
      </CardFooter>
    </div>
  );
}
