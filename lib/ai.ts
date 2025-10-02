import { Coord, BoardState } from "./types";
import { coordToXY, xyToCoord } from "./game";

/**
 * AI using Hunt/Target mode
 * - Hunt: random shots with parity optimization
 * - Target: after a hit, search adjacent cells until ship is sunk
 */
export class BattleshipAI {
  private history: Set<string> = new Set();
  private targetQueue: Coord[] = [];
  private lastHit: Coord | null = null;

  /**
   * Select next shot coordinate
   */
  selectShot(boardSize: number): Coord {
    // Target mode: we have hits to follow up on
    if (this.targetQueue.length > 0) {
      const target = this.targetQueue.shift()!;

      // Skip if already fired
      if (this.history.has(target)) {
        return this.selectShot(boardSize);
      }

      this.history.add(target);
      return target;
    }

    // Hunt mode: random with parity
    return this.huntMode(boardSize);
  }

  /**
   * Record the result of a shot
   */
  recordShot(coord: Coord, hit: boolean, sunk: boolean): void {
    this.history.add(coord);

    if (hit) {
      this.lastHit = coord;

      if (!sunk) {
        // Add adjacent cells to target queue
        this.addAdjacentCells(coord);
      } else {
        // Ship sunk, clear target queue
        this.targetQueue = [];
        this.lastHit = null;
      }
    }
  }

  /**
   * Hunt mode: random shots with parity optimization
   * Only targets cells where a ship of length >= 2 could fit
   */
  private huntMode(boardSize: number): Coord {
    // Try parity pattern first (checkerboard)
    for (let tries = 0; tries < 5000; tries++) {
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);

      // Parity: skip cells where (x + y) is odd
      if ((x + y) % 2 !== 0) continue;

      const coord = xyToCoord(x, y);
      if (!this.history.has(coord)) {
        this.history.add(coord);
        return coord;
      }
    }

    // Fallback: any unfired cell
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const coord = xyToCoord(x, y);
        if (!this.history.has(coord)) {
          this.history.add(coord);
          return coord;
        }
      }
    }

    // Should never reach here
    throw new Error("No valid shots remaining");
  }

  /**
   * Add adjacent cells (up, down, left, right) to target queue
   */
  private addAdjacentCells(coord: Coord): void {
    const { x, y } = coordToXY(coord);

    const adjacent: Array<{ x: number; y: number }> = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const { x: ax, y: ay } of adjacent) {
      if (ax >= 0 && ay >= 0 && ax < 10 && ay < 10) {
        const adjacentCoord = xyToCoord(ax, ay);
        if (!this.history.has(adjacentCoord) && !this.targetQueue.includes(adjacentCoord)) {
          this.targetQueue.push(adjacentCoord);
        }
      }
    }
  }

  /**
   * Reset AI state (for new game)
   */
  reset(): void {
    this.history.clear();
    this.targetQueue = [];
    this.lastHit = null;
  }
}

/**
 * Factory function to create a new AI instance
 */
export function createAI(): BattleshipAI {
  return new BattleshipAI();
}
