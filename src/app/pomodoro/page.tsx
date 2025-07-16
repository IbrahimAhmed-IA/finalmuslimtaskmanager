"use client";

import MainLayout from "@/components/layout/main-layout";
import PomodoroTimer from "@/components/pomodoro/pomodoro-timer";
import { useWeeklyScoreContext } from "@/context/weekly-score-context";
import React, { useEffect } from "react";

// Component to handle context
const PomodoroContent = () => {
  const { checkWeekEnd } = useWeeklyScoreContext();

  useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  return <PomodoroTimer />;
};

export default function PomodoroPage() {
  return (
    <MainLayout>
      <PomodoroContent />
    </MainLayout>
  );
}
