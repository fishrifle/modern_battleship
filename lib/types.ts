export type Coord = `${string}${number}`;
export type ShipKind = "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
export type CellState = "unknown" | "miss" | "hit" | "sunk";
export type GameStatus = "waiting" | "placing" | "active" | "finished";

export interface Vessel {
  name: string;
  class?: string;
  kind: ShipKind;
  length: number;
  image?: string;
}

export interface Placement {
  kind: ShipKind;
  cells: Coord[];
  vessel: Vessel;
}

export interface BoardState {
  size: number;
  cells: Record<string, CellState>;
  ships: Placement[];
}

export interface Player {
  id: string;
  username: string;
  country: string;
  ready: boolean;
  board?: BoardState;
  isBot?: boolean;
}

export interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  currentTurn: string;
  winnerId?: string;
  boardSize: number;
}

export interface ShotResult {
  coord: Coord;
  hit: boolean;
  sunk: boolean;
  shipKind?: ShipKind;
}
