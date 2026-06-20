"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { shipmentCards } from "@/lib/data";

export default function ShipmentCards() {
  const [active, setActive] = useState("SHP-4281");

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">Active Shipments</h2>
        <button className="text-xs font-medium text-accent-purple hover:underline">View all</button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {shipmentCards.map((card, i) => (
          <motion.button
            key={card.id}
            onClick={() => setActive(card.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-shrink-0 w-56 bg-card rounded-2xl p-4 text-left border transition-all duration-200 ${
              active === card.id
                ? "border-accent-purple/40 shadow-md shadow-accent-purple/5"
                : "border-border-light shadow-sm hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-text-primary">{card.id}</span>
              {active === card.id && (
                <motion.div layoutId="activeDot" className="w-2 h-2 rounded-full bg-accent-purple" />
              )}
            </div>
            <div className="mb-3">
              <svg viewBox="0 0 120 40" className="w-full h-6" fill="none">
                <rect x="5" y="10" width="70" height="18" rx="2" fill="#F0F0EE" stroke="#E0E0DD" strokeWidth="0.5" />
                <rect x="72" y="6" width="30" height="14" rx="2" fill="white" stroke="#E0E0DD" strokeWidth="0.5" />
                <circle cx="22" cy="30" r="5" fill="#D4D4D0" />
                <circle cx="60" cy="30" r="5" fill="#D4D4D0" />
                <circle cx="82" cy="30" r="5" fill="#D4D4D0" />
                <circle cx="95" cy="30" r="5" fill="#D4D4D0" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Route</span>
                <span className="font-medium text-text-primary">{card.route}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Weight</span>
                <span className="font-medium text-text-primary">{card.weight}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Pallets</span>
                <span className="font-medium text-text-primary">{card.pallets}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">ETA</span>
                <span className="font-medium text-success-green bg-success-green/10 px-1.5 py-0.5 rounded">{card.eta}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
