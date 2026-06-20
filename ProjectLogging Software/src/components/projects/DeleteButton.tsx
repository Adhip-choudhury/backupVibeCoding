"use client";

import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function DeleteButton({ projectId }: { projectId: string }) {
  const { session } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    deleteProject(projectId, session?.userId ?? "");
    router.push("/");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Are you sure?</span>
        <button
          onClick={handleDelete}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-700 active:scale-95"
        >
          Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95"
    >
      Delete
    </button>
  );
}
