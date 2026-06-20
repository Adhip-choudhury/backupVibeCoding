"use client";

import type { Project } from "./types";

const STORAGE_KEY = "projectlog-projects";

export function getProjects(userId: string): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Project[] = raw ? (JSON.parse(raw) as Project[]) : [];
    return all.filter((p) => p.userId === userId);
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProject(id: string, userId: string): Project | undefined {
  return getProjects(userId).find((p) => p.id === id);
}

export function addProject(project: Omit<Project, "id" | "createdAt" | "updatedAt" | "userId">, userId: string): Project {
  const now = new Date().toISOString();
  const newProject: Project = {
    ...project,
    priority: project.priority ?? "medium",
    userId,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const projects = getAllProjects();
  projects.unshift(newProject);
  saveProjects(projects);
  return newProject;
}

export function updateProject(id: string, userId: string, updates: Partial<Omit<Project, "id" | "createdAt" | "userId">>): Project | undefined {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === id && p.userId === userId);
  if (index === -1) return;
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveProjects(projects);
  return projects[index];
}

export function deleteProject(id: string, userId: string): boolean {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => !(p.id === id && p.userId === userId));
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

function getAllProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}
