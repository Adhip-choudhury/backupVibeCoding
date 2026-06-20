"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProjectCard from "@/components/projects/ProjectCard";
import { getProjects } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import type { Project } from "@/lib/types";

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();

  const projects: Project[] = useMemo(() => {
    if (!session) return [];
    return getProjects(session.userId);
  }, [session]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? projects.filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase()) ||
              p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
          )
        : projects,
    [projects, search],
  );

  const active = filtered.filter((p) => p.status === "active");
  const completed = filtered.filter((p) => p.status === "completed");
  const other = filtered.filter((p) => p.status !== "active" && p.status !== "completed");

  if (!session) return null;

  return (
    <>
      <Header onSearch={setSearch} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-zinc-100">
              <svg className="size-8 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900">No projects yet</h2>
            <p className="mt-1 text-sm text-zinc-500">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {active.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">Active ({active.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {active.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">Completed ({completed.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {completed.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </section>
            )}

            {other.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">Other ({other.length})</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {other.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </section>
            )}

            {filtered.length === 0 && search && (
              <p className="py-16 text-center text-sm text-zinc-400">
                No projects match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
