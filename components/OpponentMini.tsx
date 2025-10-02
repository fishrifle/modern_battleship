"use client";

import { BoardState, Coord } from "@/lib/types";
import { xyToCoord } from "@/lib/game";

interface OpponentMiniProps {
  board: BoardState;
  opponentName: string;
  onCellClick?: (coord: Coord) => void;
}

export default function OpponentMini({ board, opponentName, onCellClick }: OpponentMiniProps) {
  const { size, cells } = board;
  const cols = Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: size }, (_, i) => i + 1);

  const getCellState = (coord: Coord) => {
    return cells[coord] || "unknown";
  };

  const getCellClass = (coord: Coord) => {
    const state = getCellState(coord);
    let baseClass = "w-full h-full border border-slate-700 transition-all";

    if (state === "unknown") {
      baseClass += " bg-slate-800 hover:bg-slate-700 cursor-pointer";
    } else if (state === "miss") {
      baseClass += " bg-slate-600";
    } else if (state === "hit") {
      baseClass += " bg-orange-600";
    } else if (state === "sunk") {
      baseClass += " bg-red-700";
    }

    return baseClass;
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-center mb-3 text-gray-300">
        {opponentName}'s Waters
      </h3>

      <div className="inline-block">
        {/* Column labels */}
        <div className="grid" style={{ gridTemplateColumns: `20px repeat(${size}, 1fr)` }}>
          <div></div>
          {cols.map(col => (
            <div key={col} className="text-center text-[10px] font-semibold text-gray-500 pb-1">
              {col}
            </div>
          ))}
        </div>

        {/* Board grid */}
        <div className="grid gap-0" style={{ gridTemplateColumns: `20px repeat(${size}, 1fr)` }}>
          {rows.map(row => (
            <>
              <div key={`row-${row}`} className="flex items-center justify-center text-[10px] font-semibold text-gray-500 pr-1">
                {row}
              </div>
              {cols.map(col => {
                const coord = xyToCoord(cols.indexOf(col), row - 1);
                return (
                  <div
                    key={coord}
                    className="w-6 h-6"
                    onClick={() => onCellClick && onCellClick(coord)}
                  >
                    <div className={getCellClass(coord)}>
                      <div className="w-full h-full flex items-center justify-center text-[8px]">
                        {getCellState(coord) === "miss" && "○"}
                        {getCellState(coord) === "hit" && "✕"}
                        {getCellState(coord) === "sunk" && "☠"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
