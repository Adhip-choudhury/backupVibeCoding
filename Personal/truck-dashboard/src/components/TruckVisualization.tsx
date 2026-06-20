"use client";

import { motion } from "framer-motion";
import { kpiStats } from "@/lib/data";

function KpiBadge({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-2xl shadow-sm border border-border-light">
      <span className="text-sm text-text-secondary font-medium">{label}</span>
      <span className="text-lg font-semibold text-text-primary">{value}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        positive ? "bg-success-green/20 text-green-700" : "bg-danger-alert/15 text-danger-alert"
      }`}>
        {change}
      </span>
    </div>
  );
}

function ZoomControls() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button className="w-10 h-10 rounded-full bg-card shadow-sm border border-border-light flex items-center justify-center text-text-secondary hover:text-text-primary hover:shadow-md transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div className="w-10 h-28 rounded-full bg-card shadow-sm border border-border-light flex flex-col items-center justify-center gap-1">
        <div className="w-1 h-16 rounded-full bg-border-light relative">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent-purple shadow-sm"
            layoutId="zoomThumb"
          />
        </div>
      </div>
      <button className="w-10 h-10 rounded-full bg-card shadow-sm border border-border-light flex items-center justify-center text-text-secondary hover:text-text-primary hover:shadow-md transition-all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

function TruckSvg() {
  return (
    <svg viewBox="0 0 900 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Trailer body */}
      <rect x="20" y="60" width="620" height="200" rx="8" fill="white" stroke="#E0E0DD" strokeWidth="1.5" />
      {/* Trailer roof line */}
      <rect x="20" y="60" width="620" height="8" rx="3" fill="#F0F0EE" />
      {/* Trailer bottom */}
      <rect x="20" y="252" width="620" height="8" rx="3" fill="#F0F0EE" />
      {/* Trailer vertical lines (panel dividers) */}
      {[0, 1, 2, 3].map((i) => (
        <line key={`div-${i}`} x1={175 + i * 155} y1="68" x2={175 + i * 155} y2="252" stroke="#E8E8E5" strokeWidth="1" />
      ))}
      {/* Trailer rear door frame */}
      <rect x="620" y="60" width="30" height="200" rx="4" fill="#E8E8E5" />
      {/* Chassis frame */}
      <rect x="640" y="110" width="120" height="12" rx="4" fill="#D4D4D0" />
      <rect x="640" y="198" width="120" height="12" rx="4" fill="#D4D4D0" />
      {/* Cab body */}
      <path d="M760 170 L760 80 Q760 60 780 60 L840 60 L870 60 Q890 60 890 80 L890 170 Z" fill="white" stroke="#E0E0DD" strokeWidth="1.5" />
      {/* Windshield */}
      <path d="M770 85 L770 105 Q770 110 775 110 L815 110 L815 85 Z" fill="#E8F4FD" stroke="#D0E8F5" strokeWidth="1" />
      {/* Side window */}
      <path d="M820 85 L820 110 L855 110 Q860 110 860 105 L860 85 Z" fill="#E8F4FD" stroke="#D0E8F5" strokeWidth="1" />
      {/* Door line */}
      <line x1="818" y1="80" x2="818" y2="170" stroke="#E0E0DD" strokeWidth="1" />
      {/* Door handle */}
      <rect x="822" y="120" width="6" height="2" rx="1" fill="#C0C0BB" />
      {/* Headlight */}
      <rect x="882" y="150" width="8" height="14" rx="3" fill="#FFE566" opacity="0.8" />
      {/* Taillight */}
      <rect x="640" y="245" width="12" height="8" rx="2" fill="#FF4D7A" opacity="0.6" />
      {/* Fuel tank */}
      <rect x="680" y="218" width="50" height="16" rx="4" fill="#D4D4D0" />
      {/* Exhaust */}
      <rect x="745" y="230" width="8" height="24" rx="3" fill="#A0A09B" />
      {/* Wheels - trailer rear */}
      <circle cx="185" cy="265" r="22" fill="#333" />
      <circle cx="185" cy="265" r="14" fill="#555" />
      <circle cx="185" cy="265" r="6" fill="#777" />
      <circle cx="500" cy="265" r="22" fill="#333" />
      <circle cx="500" cy="265" r="14" fill="#555" />
      <circle cx="500" cy="265" r="6" fill="#777" />
      {/* Wheels - cab */}
      <circle cx="770" cy="265" r="22" fill="#333" />
      <circle cx="770" cy="265" r="14" fill="#555" />
      <circle cx="770" cy="265" r="6" fill="#777" />
      <circle cx="860" cy="265" r="22" fill="#333" />
      <circle cx="860" cy="265" r="14" fill="#555" />
      <circle cx="860" cy="265" r="6" fill="#777" />
      {/* Ground shadow */}
      <ellipse cx="450" cy="290" rx="420" ry="6" fill="#00000008" />
    </svg>
  );
}

function CargoGrid() {
  const cells = [
    { id: "CRG-001", w: "1,240kg", filled: true },
    { id: "CRG-002", w: "980kg", filled: true },
    null,
    { id: "CRG-003", w: "1,560kg", filled: true },
    { id: "CRG-004", w: "720kg", filled: true },
    null,
    null,
    null,
    null,
    { id: "CRG-005", w: "2,100kg", filled: true },
    null,
    null,
    null,
    null,
    null,
    null,
    { id: "CRG-006", w: "640kg", filled: true },
    null,
    null,
    null,
  ];

  return (
    <div className="absolute top-[68px] left-[30px] right-[30px] bottom-[10px] grid grid-cols-5 grid-rows-4 gap-2.5">
      {cells.map((cell, i) => {
        if (!cell) {
          return (
            <motion.button
              key={`empty-${i}`}
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border-2 border-dashed border-border-light bg-bg-main/40 flex items-center justify-center opacity-50 hover:opacity-100 hover:border-accent-purple/40 hover:bg-accent-purple/5 transition-all cursor-pointer group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary/40 group-hover:text-accent-purple/60">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.button>
          );
        }
        return (
          <motion.div
            key={cell.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(123,44,255,0.15)" }}
            className="rounded-lg border border-accent-purple/20 bg-accent-purple/[0.04] flex flex-col items-center justify-center gap-0.5 cursor-grab active:cursor-grabbing transition-colors group"
          >
            <span className="text-[9px] font-semibold text-accent-purple leading-none">{cell.id}</span>
            <span className="text-[8px] text-text-secondary leading-none">{cell.w}</span>
            <div className="w-3 h-0.5 rounded-full bg-success-green/60 mt-0.5" />
          </motion.div>
        );
      })}
    </div>
  );
}

export default function TruckVisualization() {
  return (
    <section className="relative">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Trucks Management</h1>
          <p className="text-text-secondary text-sm mt-0.5">This page shows recent dispatcher activity</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-text-secondary hover:text-text-primary font-medium transition-colors">Today</button>
          <button className="text-sm text-text-secondary hover:text-text-primary font-medium transition-colors">This Week</button>
          <button className="px-4 py-2 bg-text-primary text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
            Export
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="flex items-center gap-3 mb-4">
        <KpiBadge label="Weight" value={kpiStats.weight.value} change={kpiStats.weight.change} positive={kpiStats.weight.positive} />
        <KpiBadge label="Pallets" value={kpiStats.pallets.value} change={kpiStats.pallets.change} positive={kpiStats.pallets.positive} />
        <KpiBadge label="Alerts" value={kpiStats.alerts.value} change={kpiStats.alerts.change} positive={kpiStats.alerts.positive} />
      </div>

      {/* Main Visualization */}
      <div className="relative flex gap-4">
        {/* Zoom Controls */}
        <div className="flex flex-col justify-center">
          <ZoomControls />
        </div>

        {/* Truck Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 bg-card rounded-3xl p-5 shadow-sm border border-border-light relative overflow-hidden"
        >
          <div className="relative">
            <TruckSvg />
            <CargoGrid />
          </div>

          {/* Trailer labels overlay */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-accent-purple/20 border border-accent-purple/30" />
                <span className="text-xs text-text-secondary">Loaded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm border-2 border-dashed border-border-light" />
                <span className="text-xs text-text-secondary">Available</span>
              </div>
            </div>
            <span className="text-xs text-text-secondary">Total capacity: 26 pallets — 14 occupied</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
