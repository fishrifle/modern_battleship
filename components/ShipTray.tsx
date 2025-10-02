"use client";

import { Vessel, ShipKind, Placement, Coord } from "@/lib/types";
import { SHIP_SIZES } from "@/lib/fleets";
import { generateRandomPlacement } from "@/lib/game";

interface ShipTrayProps {
  fleet: Vessel[];
  onPlacementComplete: (placements: Placement[]) => void;
}

export default function ShipTray({ fleet, onPlacementComplete }: ShipTrayProps) {
  const handleRandomPlacement = () => {
    const ships = fleet.map(vessel => ({ kind: vessel.kind, vessel }));
    const placements = generateRandomPlacement(10, ships);
    onPlacementComplete(placements);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-center">Your Fleet</h3>

      <div className="space-y-3 mb-6">
        {fleet.map((vessel, idx) => (
          <div
            key={idx}
            className="bg-slate-800 p-3 rounded border border-slate-600"
          >
            <div className="font-semibold text-sm text-blue-300">{vessel.kind.toUpperCase()}</div>
            <div className="text-xs text-gray-400">{vessel.name}</div>
            <div className="text-xs text-gray-500">{vessel.class}</div>
            <div className="mt-1">
              <div className="flex gap-1">
                {Array.from({ length: vessel.length }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-blue-700 border border-blue-500 rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleRandomPlacement}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all"
        >
          🎲 Random Placement
        </button>

        <div className="text-xs text-center text-gray-500">
          Manual placement coming soon! For now, use random placement.
        </div>
      </div>
    </div>
  );
}
