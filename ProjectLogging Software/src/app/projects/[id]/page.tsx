"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProjectForm from "@/components/projects/ProjectForm";
import DeleteButton from "@/components/projects/DeleteButton";
import { getProject } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { Project } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-sky-100 text-sky-700",
};

export default function ProjectDetail() {
  const { session } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  const project: Project | null = useMemo(() => {
    if (!session) return null;
    return getProject(id, session.userId) ?? null;
  }, [session, id]);

  if (!session) return null;

  if (!project) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-zinc-500">Project not found.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4">
            Back to all projects
          </Link>
        </main>
      </>
    );
  }

  if (editing) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-12">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit Project</h1>
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
          </div>
          <ProjectForm project={project} />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-2">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600">
            &larr; Back
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{project.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Created {formatDate(project.createdAt)} &middot; Updated {formatDate(project.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
            >
              Edit
            </button>
            <DeleteButton projectId={project.id} />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            {project.status}
          </span>
          {project.priority && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${priorityColors[project.priority] || "bg-zinc-100 text-zinc-600"}`}>
              {project.priority} priority
            </span>
          )}
          {project.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {project.description || "No description provided."}
          </p>
        </div>
      </main>
    </>
  );
}
