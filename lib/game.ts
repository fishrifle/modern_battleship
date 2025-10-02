import { Coord, ShipKind, Placement, BoardState } from "./types";
import { SHIP_SIZES } from "./fleets";

/**
 * Convert coordinate like "C11" to {x, y}
 * Supports A-Z (columns) and 1-26 (rows)
 */
export function coordToXY(c: Coord): { x: number; y: number } {
  const m = c.match(/^([A-Za-z]+)(\d{1,2})$/);
  if (!m) throw new Error(`Invalid coordinate: ${c}`);

  const col = m[1].toUpperCase();
  const row = parseInt(m[2], 10) - 1; // Convert to 0-indexed

  // A->0, B->1, C->2, etc.
  const x = col.charCodeAt(0) - 65;

  return { x, y: row };
}

/**
 * Convert {x, y} back to coordinate like "C11"
 */
export function xyToCoord(x: number, y: number): Coord {
  const col = String.fromCharCode(65 + x); // 0->A, 1->B, etc.
  const row = y + 1; // Convert to 1-indexed
  return `${col}${row}` as Coord;
}

/**
 * Validate ship placement on a board
 */
export function validatePlacement(
  boardSize: number,
  placements: Placement[]
): boolean {
  const seen = new Set<string>();

  for (const placement of placements) {
    const expectedLength = SHIP_SIZES[placement.kind];

    // Check length matches
    if (placement.cells.length !== expectedLength) {
      console.error(`Ship ${placement.kind} has wrong length: ${placement.cells.length} vs ${expectedLength}`);
      return false;
    }

    // Check all cells are in bounds and not overlapping
    for (const cell of placement.cells) {
      const { x, y } = coordToXY(cell);

      if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
        console.error(`Cell ${cell} out of bounds`);
        return false;
      }

      const key = `${x},${y}`;
      if (seen.has(key)) {
        console.error(`Cell ${cell} overlaps with another ship`);
        return false;
      }
      seen.add(key);
    }

    // Check cells form a straight line (horizontal or vertical)
    const xs = new Set(placement.cells.map(c => coordToXY(c).x));
    const ys = new Set(placement.cells.map(c => coordToXY(c).y));

    const isHorizontal = ys.size === 1 && xs.size === placement.cells.length;
    const isVertical = xs.size === 1 && ys.size === placement.cells.length;

    if (!isHorizontal && !isVertical) {
      console.error(`Ship ${placement.kind} is not in a straight line`);
      return false;
    }
  }

  return true;
}

/**
 * Generate random placement for all ships
 */
export function generateRandomPlacement(
  boardSize: number,
  ships: { kind: ShipKind; vessel: any }[]
): Placement[] {
  const placements: Placement[] = [];
  const occupied = new Set<string>();

  for (const ship of ships) {
    const length = SHIP_SIZES[ship.kind];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 1000) {
      attempts++;

      const horizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * (horizontal ? boardSize - length + 1 : boardSize));
      const y = Math.floor(Math.random() * (horizontal ? boardSize : boardSize - length + 1));

      // Check if all cells are free
      const cells: Coord[] = [];
      let canPlace = true;

      for (let i = 0; i < length; i++) {
        const cx = horizontal ? x + i : x;
        const cy = horizontal ? y : y + i;
        const key = `${cx},${cy}`;

        if (occupied.has(key)) {
          canPlace = false;
          break;
        }

        cells.push(xyToCoord(cx, cy));
      }

      if (canPlace) {
        // Mark cells as occupied
        for (const cell of cells) {
          const { x, y } = coordToXY(cell);
          occupied.add(`${x},${y}`);
        }

        placements.push({
          kind: ship.kind,
          cells,
          vessel: ship.vessel,
        });

        placed = true;
      }
    }

    if (!placed) {
      throw new Error(`Could not place ship ${ship.kind} after ${attempts} attempts`);
    }
  }

  return placements;
}

/**
 * Create an empty board
 */
export function createEmptyBoard(size: number): BoardState {
  return {
    size,
    cells: {},
    ships: [],
  };
}

/**
 * Check if a coordinate has been fired at
 */
export function isCellFired(board: BoardState, coord: Coord): boolean {
  return !!board.cells[coord];
}

/**
 * Process a shot and return the result
 */
export function processShot(
  board: BoardState,
  coord: Coord
): { hit: boolean; sunk: boolean; shipKind?: ShipKind } {
  // Check if already fired
  if (isCellFired(board, coord)) {
    throw new Error(`Cell ${coord} already fired at`);
  }

  // Check if hit
  let hitShip: Placement | undefined;
  for (const ship of board.ships) {
    if (ship.cells.includes(coord)) {
      hitShip = ship;
      break;
    }
  }

  if (hitShip) {
    board.cells[coord] = "hit";

    // Check if ship is sunk
    const allHit = hitShip.cells.every(c => board.cells[c] === "hit");

    if (allHit) {
      // Mark all cells as sunk
      for (const c of hitShip.cells) {
        board.cells[c] = "sunk";
      }

      return { hit: true, sunk: true, shipKind: hitShip.kind };
    }

    return { hit: true, sunk: false, shipKind: hitShip.kind };
  } else {
    board.cells[coord] = "miss";
    return { hit: false, sunk: false };
  }
}

/**
 * Check if all ships are sunk
 */
export function isFleetDestroyed(board: BoardState): boolean {
  return board.ships.every(ship =>
    ship.cells.every(c => board.cells[c] === "sunk")
  );
}

/**
 * Get the board state for a client (hide ships if not owner)
 */
export function getClientBoard(board: BoardState, isOwner: boolean): Partial<BoardState> {
  if (isOwner) {
    return board;
  }

  // Only show fired cells, hide ship locations
  return {
    size: board.size,
    cells: board.cells,
    ships: [], // Don't reveal ship locations
  };
}
