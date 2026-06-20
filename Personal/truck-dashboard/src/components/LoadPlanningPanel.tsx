"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { freightAssignments, dispatcherOptions } from "@/lib/data";

function ToolbarButton({ label }: { label: string }) {
  const icons: Record<string, React.ReactNode> = {
    Refresh: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    Save: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Undo: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 7 3 12 8 12" /><path d="M21 17a9 9 0 0 0-15-6.7L3 12" /></svg>,
    "AI Optimize": <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  };
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-9 h-9 rounded-xl bg-bg-main flex items-center justify-center text-text-secondary hover:text-accent-purple hover:bg-accent-purple/5 transition-colors"
      title={label}
    >
      {icons[label] || <span className="text-xs font-medium">{label[0]}</span>}
    </motion.button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    planned: "bg-accent-purple/10 text-accent-purple",
    loading: "bg-amber-100 text-amber-700",
    pending: "bg-bg-main text-text-secondary",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors[status] || "bg-bg-main text-text-secondary"}`}>
      {status}
    </span>
  );
}

export default function LoadPlanningPanel() {
  const [selectedDispatcher, setSelectedDispatcher] = useState(dispatcherOptions[0]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="bg-card rounded-3xl shadow-md border border-border-light p-5 h-fit"
    >
      {/* Dispatcher Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border-light">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedDispatcher.name}
              onChange={(e) => {
                const found = dispatcherOptions.find((d) => d.name === e.target.value);
                if (found) setSelectedDispatcher(found);
              }}
              className="appearance-none bg-transparent text-sm font-semibold text-text-primary pr-5 cursor-pointer outline-none"
            >
              {dispatcherOptions.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-text-secondary pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-semibold flex items-center justify-center">
            {selectedDispatcher.avatar}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 bg-text-primary text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity">
            Send to driver
          </button>
          <button className="w-8 h-8 rounded-full bg-bg-main flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </button>
        </div>
      </div>

      {/* Load Planning Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">Load Planning</h2>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium text-accent-purple hover:underline">+ Create New Plan</button>
          <span className="text-[10px] text-text-secondary">|</span>
          <button className="text-xs text-text-secondary hover:text-text-primary transition-colors">Clear</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-5">
        <ToolbarButton label="Refresh" />
        <ToolbarButton label="Save" />
        <ToolbarButton label="Undo" />
        <div className="w-px h-6 bg-border-light mx-1" />
        <ToolbarButton label="AI Optimize" />
        <ToolbarButton label="More" />
      </div>

      {/* Assignments Table */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-[1fr_0.8fr_0.6fr_0.5fr] gap-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 px-1">
          <span>Item</span>
          <span>Vehicle</span>
          <span>Sequence</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="space-y-1">
          {freightAssignments.map((fa, i) => (
            <motion.div
              key={fa.item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[1fr_0.8fr_0.6fr_0.5fr] gap-3 items-center py-2.5 px-2 rounded-xl hover:bg-accent-purple/[0.03] transition-colors group"
            >
              <span className="text-sm font-medium text-text-primary">{fa.item}</span>
              <span className="text-sm text-text-secondary">{fa.vehicle}</span>
              <div><StatusBadge status={fa.sequence} /> <span className="text-xs text-text-secondary ml-1">{fa.status}</span></div>
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-6 h-6 rounded-md hover:bg-bg-main flex items-center justify-center text-text-secondary hover:text-accent-purple transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="w-6 h-6 rounded-md hover:bg-bg-main flex items-center justify-center text-text-secondary hover:text-danger-alert transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-5 pt-4 border-t border-border-light flex items-center justify-between">
        <span className="text-xs text-text-secondary">5 active assignments</span>
        <button className="text-xs font-medium text-accent-purple flex items-center gap-1 hover:underline">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add row
        </button>
      </div>
    </motion.div>
  );
}
