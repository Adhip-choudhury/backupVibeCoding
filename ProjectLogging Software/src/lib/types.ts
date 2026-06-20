export type ProjectStatus = "active" | "completed" | "on-hold" | "archived";
export type ProjectPriority = "low" | "medium" | "high";

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority?: ProjectPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
