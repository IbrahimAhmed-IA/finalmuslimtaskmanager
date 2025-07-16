"use client";

import MainLayout from "@/components/layout/main-layout";
import NotesManager from "@/components/notes/notes-manager";

export default function NotesPage() {
  return (
    <MainLayout>
      <NotesManager />
    </MainLayout>
  );
}
