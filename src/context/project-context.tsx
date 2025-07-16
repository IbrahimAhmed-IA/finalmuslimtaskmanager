import { getProjects, saveProjects } from "@/lib/storage";
import type { Project } from "@/lib/types";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectContextType {
  projects: Project[];
  addProject: (name: string, color: string) => void;
  editProject: (id: string, updates: Partial<Omit<Project, "id">>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects from localStorage on initial render
    const savedProjects = getProjects();
    setProjects(savedProjects);
  }, []);

  useEffect(() => {
    // Save projects to localStorage whenever they change
    saveProjects(projects);
  }, [projects]);

  const addProject = (name: string, color: string) => {
    if (!name.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color,
    };

    setProjects((prevProjects) => [...prevProjects, newProject]);
    toast.success("Project added successfully");
  };

  const editProject = (id: string, updates: Partial<Omit<Project, "id">>) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, ...updates } : project,
      ),
    );
    toast.success("Project updated");
  };

  const deleteProject = (id: string) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== id),
    );
    toast.success("Project deleted");
  };

  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        editProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
