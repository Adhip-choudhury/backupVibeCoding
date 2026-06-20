"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  completed: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "on-hold": "bg-amber-50 text-amber-700 ring-amber-600/20",
  archived: "bg-zinc-50 text-zinc-600 ring-zinc-500/20",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md active:scale-[0.98]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700">{project.name}</h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[project.status] || "bg-zinc-50 text-zinc-600 ring-zinc-500/20"}`}
        >
          {project.status}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-500">
        {project.description || "No description"}
      </p>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{formatDate(project.createdAt)}</span>
        {project.tags.length > 0 && (
          <div className="flex gap-1">
            {project.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className="text-zinc-300">+{project.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
