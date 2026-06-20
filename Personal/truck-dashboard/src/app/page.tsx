"use client";

import Navbar from "@/components/Navbar";
import TruckVisualization from "@/components/TruckVisualization";
import LoadPlanningPanel from "@/components/LoadPlanningPanel";
import ShipmentCards from "@/components/ShipmentCards";
import GanttChart from "@/components/GanttChart";

export default function Home() {
  return (
    <div className="min-h-dvh bg-bg-main">
      <div className="max-w-[1600px] mx-auto px-6 py-5 space-y-6">
        <Navbar />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <TruckVisualization />
            <ShipmentCards />
            <GanttChart />
          </div>
          <div className="w-[320px] flex-shrink-0">
            <div className="sticky top-6">
              <LoadPlanningPanel />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between py-4 text-xs text-text-secondary border-t border-border-light">
          <span>Truck&Co — AI Fleet Management v2.4</span>
          <span>All systems operational · 12 active dispatches</span>
        </footer>
      </div>
    </div>
  );
}
