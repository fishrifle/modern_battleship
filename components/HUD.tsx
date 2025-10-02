"use client";

import { useState } from "react";
import { Coord } from "@/lib/types";
import { coordToXY } from "@/lib/game";

interface HUDProps {
  isYourTurn: boolean;
  currentPlayer: string;
  onFireShot: (coord: Coord) => void;
  gameStatus: string;
}

export default function HUD({ isYourTurn, currentPlayer, onFireShot, gameStatus }: HUDProps) {
  const [coordInput, setCoordInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!coordInput.trim()) {
      setError("Enter a coordinate (e.g., C11)");
      return;
    }

    try {
      const coord = coordInput.toUpperCase().trim() as Coord;
      coordToXY(coord); // Validate coordinate format
      onFireShot(coord);
      setCoordInput("");
    } catch (err) {
      setError("Invalid coordinate format. Use format like C11");
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
      <div className="text-center mb-4">
        <div className="text-sm text-gray-400 mb-1">Status</div>
        <div className={`text-xl font-bold ${isYourTurn ? "text-green-400" : "text-orange-400"}`}>
          {gameStatus === "active" ? (
            isYourTurn ? "YOUR TURN" : `${currentPlayer}'s Turn`
          ) : gameStatus === "placing" ? (
            "PLACE YOUR SHIPS"
          ) : (
            "WAITING..."
          )}
        </div>
      </div>

      {gameStatus === "active" && isYourTurn && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Call Your Shot
            </label>
            <input
              type="text"
              value={coordInput}
              onChange={(e) => setCoordInput(e.target.value)}
              placeholder="e.g., C11, A5, J10"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              disabled={!isYourTurn}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={!isYourTurn}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all"
          >
            🎯 FIRE!
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-xs text-gray-500 space-y-1">
          <div>○ = Miss</div>
          <div>✕ = Hit</div>
          <div>☠ = Sunk</div>
        </div>
      </div>
    </div>
  );
}
