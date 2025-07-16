"use client";

import MainLayout from "@/components/layout/main-layout";
import TaskManager from "@/components/task-manager/task-manager";
import WidgetDashboard from "@/components/widgets/widget-dashboard";
import { useAppSettings } from "@/context/app-settings-context";
import { useWeeklyScoreContext } from "@/context/weekly-score-context";
import React, { useEffect } from "react";
import { TutorialOverlay } from "@/components/ui/tutorial-overlay";

// Home content component that handles weekly score checking
const HomeContent = () => {
  const { checkWeekEnd } = useWeeklyScoreContext();
  const { settings } = useAppSettings();

  useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  return (
    <div className="main-content p-6 fade-in">
      {settings.advancedMode ? <WidgetDashboard /> : <TaskManager />}
    </div>
  );
};

const tutorialSteps = [
  {
    selector: '[data-tutorial-id="sidebar-tasks"]',
    message: 'This is your main Tasks page! All your daily tasks live here. 📝',
    arrow: 'right' as const,
  },
  {
    selector: '[data-tutorial-id="task-input"]',
    message: 'Type your new task here. Make it count! 😁',
    arrow: 'top' as const,
  },
  {
    selector: '[data-tutorial-id="add-task-btn"]',
    message: 'Click here to add your task. Don\'t be shy, add as many as you want! 🎉',
    arrow: 'top' as const,
  },
];

export default function Home() {
  return (
    <MainLayout>
      <HomeContent />
      <TutorialOverlay steps={tutorialSteps} storageKey="tutorial_main_completed" />
    </MainLayout>
  );
}
