import { AppSettingsProvider } from "@/context/app-settings-context";
import { NoteProvider } from "@/context/note-context";
import { PomodoroProvider } from "@/context/pomodoro-context";
import { ProjectProvider } from "@/context/project-context";
import { TaskProvider } from "@/context/task-context";
import { WeeklyScoreProvider } from "@/context/weekly-score-context";
import type React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AppSettingsProvider>
      <ProjectProvider>
        <TaskProvider>
          <NoteProvider>
            <PomodoroProvider>
              <WeeklyScoreProvider>{children}</WeeklyScoreProvider>
            </PomodoroProvider>
          </NoteProvider>
        </TaskProvider>
      </ProjectProvider>
    </AppSettingsProvider>
  );
}
