"use client";

import { Toaster } from "@/components/ui/toaster";
import type React from "react";
import { AppSettingsProvider } from "./context/app-settings-context";
import { NoteProvider } from "./context/note-context";
import { PomodoroProvider } from "./context/pomodoro-context";
import { ProjectProvider } from "./context/project-context";
import { TaskProvider } from "./context/task-context";
import { WeeklyScoreProvider } from "./context/weekly-score-context";
import { WidgetLayoutProvider } from "./context/widget-layout-context";

export default function ClientProviders({
  children,
}: { children: React.ReactNode }) {
  return (
    <AppSettingsProvider>
      <TaskProvider>
        <PomodoroProvider>
          <ProjectProvider>
            <NoteProvider>
              <WeeklyScoreProvider>
                <WidgetLayoutProvider>
                  {children}
                  <Toaster />
                </WidgetLayoutProvider>
              </WeeklyScoreProvider>
            </NoteProvider>
          </ProjectProvider>
        </PomodoroProvider>
      </TaskProvider>
    </AppSettingsProvider>
  );
}
