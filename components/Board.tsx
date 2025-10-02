"use client";

import { BoardState, Coord, Placement } from "@/lib/types";
import { coordToXY, xyToCoord } from "@/lib/game";

interface BoardProps {
  board: BoardState;
  isOwn: boolean;
  onCellClick?: (coord: Coord) => void;
  className?: string;
}

export default function Board({ board, isOwn, onCellClick, className = "" }: BoardProps) {
  const { size, cells, ships } = board;
  const cols = Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i)); // A-J
  const rows = Array.from({ length: size }, (_, i) => i + 1); // 1-10

  const getCellState = (coord: Coord) => {
    return cells[coord] || "unknown";
  };

  const hasShip = (coord: Coord) => {
    if (!isOwn) return false;
    return ships.some(ship => ship.cells.includes(coord));
  };

  const getCellClass = (coord: Coord) => {
    const state = getCellState(coord);
    const ship = hasShip(coord);

    let baseClass = "w-full h-full border border-slate-600 transition-all duration-200";

    if (state === "unknown") {
      baseClass += ship ? " bg-blue-800" : " bg-slate-800 hover:bg-slate-700";
    } else if (state === "miss") {
      baseClass += " bg-slate-600";
    } else if (state === "hit") {
      baseClass += " bg-orange-600";
    } else if (state === "sunk") {
      baseClass += " bg-red-700";
    }

    if (onCellClick && state === "unknown" && !isOwn) {
      baseClass += " cursor-pointer";
    }

    return baseClass;
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Column labels */}
      <div className="grid" style={{ gridTemplateColumns: `40px repeat(${size}, 1fr)` }}>
        <div></div>
        {cols.map(col => (
          <div key={col} className="text-center text-sm font-semibold text-gray-400 pb-2">
            {col}
          </div>
        ))}
      </div>

      {/* Board grid with row labels */}
      <div className="grid gap-0" style={{ gridTemplateColumns: `40px repeat(${size}, 1fr)` }}>
        {rows.map(row => (
          <>
            {/* Row label */}
            <div key={`row-${row}`} className="flex items-center justify-center text-sm font-semibold text-gray-400 pr-2">
              {row}
            </div>

            {/* Cells */}
            {cols.map(col => {
              const coord = xyToCoord(cols.indexOf(col), row - 1);
              return (
                <div
                  key={coord}
                  className="aspect-square"
                  onClick={() => onCellClick && onCellClick(coord)}
                >
                  <div className={getCellClass(coord)}>
                    {/* Cell state indicator */}
                    <div className="w-full h-full flex items-center justify-center text-xs">
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
  );
}
