"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProjectForm from "@/components/projects/ProjectForm";
import { useAuth } from "@/contexts/AuthContext";

export default function NewProjectPage() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  if (!session) return null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">New Project</h1>
        <ProjectForm />
      </main>
    </>
  );
}
