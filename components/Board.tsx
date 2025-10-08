"use client";

import React from "react";
import { BoardState, Coord, Placement } from "@/lib/types";
import { coordToXY, xyToCoord } from "@/lib/game";

interface BoardProps {
  board: BoardState;
  isOwn: boolean;
  onCellClick?: (coord: Coord) => void;
  className?: string;
  hoverPreview?: {
    coord: Coord | null;
    length: number;
    rotation: "horizontal" | "vertical";
  };
}

export default function Board({ board, isOwn, onCellClick, className = "", hoverPreview }: BoardProps) {
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

  const isInHoverPreview = (coord: Coord) => {
    if (!hoverPreview || !hoverPreview.coord) return false;

    const match = hoverPreview.coord.match(/^([A-Z])(\d+)$/);
    if (!match) return false;

    const startX = match[1].charCodeAt(0) - 65;
    const startY = parseInt(match[2]) - 1;

    const coordMatch = coord.match(/^([A-Z])(\d+)$/);
    if (!coordMatch) return false;

    const x = coordMatch[1].charCodeAt(0) - 65;
    const y = parseInt(coordMatch[2]) - 1;

    if (hoverPreview.rotation === "horizontal") {
      return y === startY && x >= startX && x < startX + hoverPreview.length;
    } else {
      return x === startX && y >= startY && y < startY + hoverPreview.length;
    }
  };

  const getShipSegmentType = (coord: Coord) => {
    if (!isOwn) return null;

    for (const ship of ships) {
      const idx = ship.cells.indexOf(coord);
      if (idx === -1) continue;

      const isHorizontal = ship.cells.length > 1 &&
        ship.cells[0].charCodeAt(0) !== ship.cells[1].charCodeAt(0);

      if (ship.cells.length === 1) return 'single';
      if (idx === 0) return isHorizontal ? 'bow-h' : 'bow-v';
      if (idx === ship.cells.length - 1) return isHorizontal ? 'stern-h' : 'stern-v';
      return isHorizontal ? 'mid-h' : 'mid-v';
    }
    return null;
  };

  const getCellClass = (coord: Coord) => {
    const state = getCellState(coord);
    const ship = hasShip(coord);
    const inPreview = isInHoverPreview(coord);
    const segmentType = getShipSegmentType(coord);

    let baseClass = "w-full h-full border border-slate-600 transition-all duration-200 relative overflow-hidden";

    if (state === "unknown") {
      if (inPreview) {
        baseClass += " bg-cyan-500/40 border-cyan-400";
      } else if (ship) {
        baseClass += " bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 border-gray-500";
      } else {
        baseClass += " bg-slate-800 hover:bg-slate-700";
      }
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

    if (onCellClick && isOwn && state === "unknown") {
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
          <React.Fragment key={`row-${row}`}>
            {/* Row label */}
            <div className="flex items-center justify-center text-sm font-semibold text-gray-400 pr-2">
              {row}
            </div>

            {/* Cells */}
            {cols.map(col => {
              const coord = xyToCoord(cols.indexOf(col), row - 1);
              const inPreview = isInHoverPreview(coord);

              const segmentType = getShipSegmentType(coord);
              const state = getCellState(coord);
              const ship = hasShip(coord);

              return (
                <div
                  key={coord}
                  className="aspect-square"
                  data-coord={coord}
                  onClick={() => onCellClick && onCellClick(coord)}
                >
                  <div className={getCellClass(coord)}>
                    {/* Ship visual */}
                    {ship && state === "unknown" && (
                      <>
                        {/* Ship hull detail */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-slate-400/30 to-transparent"></div>
                        </div>
                        {/* Deck lines */}
                        {segmentType?.includes('h') && (
                          <>
                            <div className="absolute top-1/3 left-0 right-0 h-px bg-slate-500/50"></div>
                            <div className="absolute top-2/3 left-0 right-0 h-px bg-slate-500/50"></div>
                          </>
                        )}
                        {segmentType?.includes('v') && (
                          <>
                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-slate-500/50"></div>
                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-slate-500/50"></div>
                          </>
                        )}
                        {/* Bow/Stern indicators */}
                        {segmentType === 'bow-h' && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-gray-500 border-b-[6px] border-b-transparent"></div>
                        )}
                        {segmentType === 'bow-v' && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-gray-500 border-r-[6px] border-r-transparent"></div>
                        )}
                      </>
                    )}

                    {/* Cell state indicator */}
                    <div className="w-full h-full flex items-center justify-center text-xs relative z-10">
                      {state === "miss" && <span className="text-blue-300">○</span>}
                      {state === "hit" && <span className="text-2xl">💥</span>}
                      {state === "sunk" && <span className="text-xl">☠️</span>}
                      {inPreview && state === "unknown" && (
                        <div className="absolute inset-0 bg-cyan-400/30 rounded animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
