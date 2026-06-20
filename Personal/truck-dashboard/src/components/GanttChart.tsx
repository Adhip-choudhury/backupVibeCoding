"use client";

import { motion } from "framer-motion";
import { timelineRoutes } from "@/lib/data";

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ["Mon 26", "Tue 27", "Wed 28", "Thu 29", "Fri 30"];

function TimelineBar({ start, end, color }: { start: number; end: number; color: string }) {
  const left = (start / 24) * 100;
  const width = ((end - start) / 24) * 100;
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: `${width}%`, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute h-[18px] rounded-full top-1/2 -translate-y-1/2"
      style={{
        left: `${left}%`,
        background: `linear-gradient(90deg, ${color}dd, ${color}99)`,
        boxShadow: `0 0 8px ${color}33`,
      }}
    />
  );
}

function StatusIcon({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "in-transit": "bg-success-green",
    scheduled: "bg-accent-purple",
    completed: "bg-text-secondary",
    delayed: "bg-danger-alert",
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status] || "bg-text-secondary"}`} />;
}

export default function GanttChart() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">Dispatch Timeline</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <div className="w-2 h-2 rounded-full bg-success-green" />
            <span>In Transit</span>
            <div className="w-2 h-2 rounded-full bg-accent-purple" />
            <span>Scheduled</span>
            <div className="w-2 h-2 rounded-full bg-danger-alert" />
            <span>Delayed</span>
          </div>
          <button className="text-xs font-medium text-accent-purple hover:underline">Adjust Schedule</button>
        </div>
      </div>

      <div className="bg-card rounded-3xl shadow-sm border border-border-light overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b border-border-light">
          <div className="w-[140px] flex-shrink-0 p-3 border-r border-border-light">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Freight Unit</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[700px]">
              {days.map((day) => (
                <div key={day} className="col-span-1 p-2 text-center border-r border-border-light last:border-r-0">
                  <span className="text-[11px] font-semibold text-text-secondary">{day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-w-[700px] border-t border-border-light">
              {days.map((day) => (
                <div key={`hours-${day}`} className="col-span-1 flex border-r border-border-light last:border-r-0">
                  {hours.filter((_, hi) => hi % 4 === 0).map((h) => (
                    <div key={h} className="flex-1 py-1 text-center border-r border-border-light/50 last:border-r-0">
                      <span className="text-[9px] text-text-secondary">{String(h).padStart(2, "0")}:00</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Rows */}
        {timelineRoutes.map((route, ri) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: ri * 0.06 }}
            className="flex border-b border-border-light last:border-b-0 hover:bg-accent-purple/[0.02] transition-colors group"
          >
            {/* Left sidebar */}
            <div className="w-[140px] flex-shrink-0 p-3 border-r border-border-light flex items-center gap-2.5">
              <StatusIcon status={route.status} />
              <div>
                <div className="text-sm font-medium text-text-primary leading-tight">{route.label}</div>
                <div className="text-[11px] text-text-secondary">{route.weight}</div>
              </div>
            </div>

            {/* Gantt tracks */}
            <div className="flex-1 overflow-x-auto">
              <div className="grid grid-cols-7 min-w-[700px]">
                {days.map((day, di) => (
                  <div
                    key={`track-${route.id}-${day}`}
                    className="col-span-1 h-12 border-r border-border-light last:border-r-0 relative bg-[repeating-linear-gradient(90deg,transparent,transparent_calc(100%/6),#F0F0EE_calc(100%/6),#F0F0EE_calc(100%/6+1px))]"
                  >
                    {route.bars
                      .filter((b) => b.day === di + 1)
                      .map((bar, bi) => (
                        <TimelineBar
                          key={`${route.id}-${di}-${bi}`}
                          start={bar.start}
                          end={bar.end}
                          color={route.status === "delayed" ? "#FF4D7A" : "#7B2CFF"}
                        />
                      ))}
                    {route.status === "delayed" && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <span className="text-[9px] font-semibold text-danger-alert bg-danger-alert/10 px-1.5 py-0.5 rounded-full">DELAYED</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Current time marker */}
        <div className="relative">
          <div className="absolute left-[calc(140px+33%)] top-0 bottom-0 w-0.5 bg-danger-alert/70 z-10">
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-danger-alert rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
