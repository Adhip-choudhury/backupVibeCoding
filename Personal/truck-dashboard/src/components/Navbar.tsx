"use client";

import { useState } from "react";
import { navTabs } from "@/lib/data";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-card rounded-[32px] shadow-sm border border-border-light">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-accent-purple flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-text-primary">Truck&Co</span>
      </div>

      <div className="flex items-center gap-1.5 bg-bg-main rounded-full p-1">
        {navTabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
              activeTab === i
                ? "bg-text-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-full bg-bg-main flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <button className="w-9 h-9 rounded-full bg-bg-main flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-alert text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
        </button>
        <button className="w-9 h-9 rounded-full bg-bg-main flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
