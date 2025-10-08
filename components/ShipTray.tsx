"use client";

import React, { useState } from "react";
import { Vessel, ShipKind, Placement, Coord } from "@/lib/types";
import { SHIP_SIZES } from "@/lib/fleets";
import { generateRandomPlacement, xyToCoord } from "@/lib/game";

interface ShipTrayProps {
  fleet: Vessel[];
  onPlacementComplete: (placements: Placement[]) => void;
  onPlacementChange?: (state: { placements: Placement[]; onCellClick: (coord: Coord) => void }) => void;
}

export default function ShipTray({ fleet, onPlacementComplete, onPlacementChange }: ShipTrayProps) {
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [rotation, setRotation] = useState<"horizontal" | "vertical">("horizontal");
  const [hoverCoord, setHoverCoord] = useState<Coord | null>(null);

  const placedShipKinds = new Set(placements.map(p => p.kind));
  const allShipsPlaced = placements.length === fleet.length;

  const handleRandomPlacement = () => {
    const ships = fleet.map(vessel => ({ kind: vessel.kind, vessel }));
    const randomPlacements = generateRandomPlacement(10, ships);
    setPlacements(randomPlacements);
    onPlacementComplete(randomPlacements);
  };

  const handleSelectShip = (index: number) => {
    const vessel = fleet[index];
    if (placedShipKinds.has(vessel.kind)) return; // Already placed
    setSelectedShipIndex(index);
  };

  const handleRotate = () => {
    setRotation(prev => prev === "horizontal" ? "vertical" : "horizontal");
  };

  const handleConfirmAll = () => {
    if (allShipsPlaced) {
      onPlacementComplete(placements);
    }
  };

  const handleClearAll = () => {
    setPlacements([]);
    setSelectedShipIndex(null);
  };

  // Notify parent of placement changes
  React.useEffect(() => {
    if (onPlacementChange) {
      onPlacementChange({
        placements,
        onCellClick: handleCellClick
      });
    }
  }, [placements, selectedShipIndex, rotation]);

  const handleCellClick = (coord: Coord) => {
    if (selectedShipIndex === null) return;

    const vessel = fleet[selectedShipIndex];
    const length = vessel.length;

    // Parse coord like "A1" to get x, y
    const match = coord.match(/^([A-Z])(\d+)$/);
    if (!match) return;

    const x = match[1].charCodeAt(0) - 65; // A=0, B=1, etc
    const y = parseInt(match[2]) - 1; // 1-indexed to 0-indexed

    // Generate ship cells based on rotation
    const cells: Coord[] = [];
    let valid = true;

    for (let i = 0; i < length; i++) {
      const cellX = rotation === "horizontal" ? x + i : x;
      const cellY = rotation === "horizontal" ? y : y + i;

      // Check bounds
      if (cellX >= 10 || cellY >= 10) {
        valid = false;
        break;
      }

      const cellCoord = xyToCoord(cellX, cellY);

      // Check for overlap with existing placements
      const overlaps = placements.some(p => p.cells.includes(cellCoord));
      if (overlaps) {
        valid = false;
        break;
      }

      cells.push(cellCoord);
    }

    if (valid) {
      const newPlacement: Placement = {
        kind: vessel.kind,
        cells,
        vessel
      };

      setPlacements([...placements, newPlacement]);
      setSelectedShipIndex(null); // Deselect after placing
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-6 rounded-2xl border-2 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.3)]">
      <h3 className="text-xl font-bold mb-4 text-center text-cyan-400">⚓ Your Fleet</h3>

      <div className="space-y-2 mb-6">
        {fleet.map((vessel, idx) => {
          const isPlaced = placedShipKinds.has(vessel.kind);
          const isSelected = selectedShipIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => handleSelectShip(idx)}
              disabled={isPlaced}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isPlaced
                  ? "bg-slate-800/50 border-green-500/50 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-600/30 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  : "bg-slate-800 border-slate-600 hover:border-blue-500 cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-blue-300">{vessel.kind.toUpperCase()}</div>
                  <div className="text-xs text-gray-400">{vessel.name}</div>
                </div>
                {isPlaced && <span className="text-green-400">✓</span>}
              </div>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: vessel.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded ${
                      isPlaced ? "bg-green-600/50" : "bg-blue-700 border border-blue-500"
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedShipIndex !== null && (
        <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-sm text-cyan-300 mb-2">
            Click on the board to place your {fleet[selectedShipIndex].kind}
          </p>
          <button
            onClick={handleRotate}
            className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-sm transition-all"
          >
            🔄 Rotate ({rotation})
          </button>
        </div>
      )}

      <div className="space-y-2">
        {allShipsPlaced && (
          <button
            onClick={handleConfirmAll}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            ✓ Confirm Fleet
          </button>
        )}

        <button
          onClick={handleRandomPlacement}
          className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-all"
        >
          🎲 Random Placement
        </button>

        {placements.length > 0 && (
          <button
            onClick={handleClearAll}
            className="w-full px-4 py-3 bg-red-600/80 hover:bg-red-600 rounded-lg font-semibold transition-all text-sm"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-center text-gray-400">
        {placements.length}/{fleet.length} ships placed
      </div>
    </div>
  );
}
