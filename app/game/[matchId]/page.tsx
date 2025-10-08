"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket, placeShips, fireShot } from "@/lib/sockets-client";
import { GameState, Coord, Placement, Player, BoardState } from "@/lib/types";
import { getFleetForCountry } from "@/lib/fleets";
import { createEmptyBoard, generateRandomPlacement, processShot, isFleetDestroyed } from "@/lib/game";
import { BattleshipAI } from "@/lib/ai";
import Board from "@/components/Board";
import OpponentMini from "@/components/OpponentMini";
import ShipTray from "@/components/ShipTray";
import HUD from "@/components/HUD";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [placing, setPlacing] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [placementState, setPlacementState] = useState<{
    placements: Placement[];
    onCellClick: (coord: Coord) => void;
  }>({ placements: [], onCellClick: () => {} });
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState<"horizontal" | "vertical">("horizontal");
  const [hoverCoord, setHoverCoord] = useState<Coord | null>(null);
  const [ai] = useState(() => new BattleshipAI());

  const handleShipPlacementClick = (coord: Coord, fleet: any[]) => {
    if (selectedShipIndex === null) return;

    const vessel = fleet[selectedShipIndex];
    const length = vessel.length;

    const match = coord.match(/^([A-Z])(\d+)$/);
    if (!match) return;

    const x = match[1].charCodeAt(0) - 65;
    const y = parseInt(match[2]) - 1;

    const cells: Coord[] = [];
    let valid = true;

    for (let i = 0; i < length; i++) {
      const cellX = rotation === "horizontal" ? x + i : x;
      const cellY = rotation === "horizontal" ? y : y + i;

      if (cellX >= 10 || cellY >= 10) {
        valid = false;
        break;
      }

      const cellCoord = `${String.fromCharCode(65 + cellX)}${cellY + 1}` as Coord;
      const overlaps = placementState.placements.some(p => p.cells.includes(cellCoord));
      if (overlaps) {
        valid = false;
        break;
      }

      cells.push(cellCoord);
    }

    if (valid) {
      const newPlacement: Placement = { kind: vessel.kind, cells, vessel };
      const newPlacements = [...placementState.placements, newPlacement];
      setPlacementState({ placements: newPlacements, onCellClick: (c: Coord) => handleShipPlacementClick(c, fleet) });
      setSelectedShipIndex(null);
    }
  };

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Get userId from localStorage (set on homepage)
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/");
      return;
    }
    setMyPlayerId(userId);

    // Check if offline mode
    const gameMode = localStorage.getItem("gameMode");
    if (gameMode === "offline") {
      // Create offline game state immediately
      const username = localStorage.getItem("username") || "Admiral";
      const country = localStorage.getItem("selectedCountry") || "USA";

      const offlineState: GameState = {
        id: matchId,
        status: "placing",
        currentTurn: userId,
        boardSize: 10,
        players: [
          { id: userId, username, country, ready: false },
          { id: "ai_opponent", username: "AI Commander", country: "Russia", ready: false, isBot: true }
        ]
      };

      setGameState(offlineState);
      return;
    }

    const socket = getSocket();
    socket.connect();

    // Listen for match state updates
    socket.on("match:state", (state: any) => {
      console.log("Match state:", state);
      setGameState(state);

      // Check if we're still in placing phase
      const me = state.players.find((p: Player) => p.id === userId);
      if (me && me.ready) {
        setPlacing(false);
      }
    });

    socket.on("match:started", () => {
      console.log("Match started!");
      setPlacing(false);
    });

    socket.on("shot:result", ({ shooterId, targetId, coord, result }: any) => {
      console.log(`Shot: ${shooterId} -> ${targetId} at ${coord}`, result);
      // State will be updated via match:state event
    });

    socket.on("match:finished", ({ winnerId, winnerName }: any) => {
      console.log(`Match finished! Winner: ${winnerName}`);
      setWinner(winnerName);
    });

    socket.on("error", (error: any) => {
      console.error("Socket error:", error);
      alert(`Error: ${error.message}`);
    });

    return () => {
      socket.off("match:state");
      socket.off("match:started");
      socket.off("shot:result");
      socket.off("match:finished");
      socket.off("error");
    };
  }, [matchId, router]);

  const handlePlaceShips = (placements: Placement[]) => {
    const gameMode = localStorage.getItem("gameMode");

    if (gameMode === "offline") {
      // Offline mode - update state directly
      if (!gameState) return;

      const updatedState = { ...gameState };
      const playerIndex = updatedState.players.findIndex(p => p.id === myPlayerId);

      if (playerIndex !== -1) {
        updatedState.players[playerIndex].board = createEmptyBoard(10);
        updatedState.players[playerIndex].board.ships = placements;
        updatedState.players[playerIndex].ready = true;

        // Auto-place AI ships
        const aiIndex = updatedState.players.findIndex(p => p.isBot);
        if (aiIndex !== -1) {
          const aiFleet = getFleetForCountry(updatedState.players[aiIndex].country);
          const aiShips = aiFleet.map(v => ({ kind: v.kind, vessel: v }));
          const aiPlacements = generateRandomPlacement(10, aiShips);

          updatedState.players[aiIndex].board = createEmptyBoard(10);
          updatedState.players[aiIndex].board.ships = aiPlacements;
          updatedState.players[aiIndex].ready = true;
        }

        // Move to active game
        updatedState.status = "active";
        setGameState(updatedState);
        setPlacing(false);
      }
    } else {
      placeShips(matchId, myPlayerId, placements);
    }
  };

  const handleFireShot = (coord: Coord) => {
    if (!gameState) return;
    const gameMode = localStorage.getItem("gameMode");

    if (gameMode === "offline") {
      // Offline mode - handle shot locally
      if (gameState.currentTurn !== myPlayerId) return;

      const opponent = gameState.players.find(p => p.id !== myPlayerId);
      if (!opponent || !opponent.board) return;

      // Check if already fired at this cell
      if (opponent.board.cells[coord]) return;

      // Process shot
      const result = processShot(opponent.board, coord);

      // Update game state
      const updatedState = { ...gameState };
      const opponentIndex = updatedState.players.findIndex(p => p.id === opponent.id);
      if (opponentIndex !== -1 && updatedState.players[opponentIndex].board) {
        updatedState.players[opponentIndex].board = opponent.board;
      }

      // Check for win
      if (isFleetDestroyed(opponent.board)) {
        setWinner(gameState.players.find(p => p.id === myPlayerId)?.username || "You");
        return;
      }

      // Switch turn to AI
      updatedState.currentTurn = opponent.id;
      setGameState(updatedState);

      // AI takes turn after delay
      setTimeout(() => executeAITurn(updatedState), 800);
    } else {
      const opponent = gameState.players.find(p => p.id !== myPlayerId);
      if (!opponent) return;
      fireShot(matchId, myPlayerId, opponent.id, coord);
    }
  };

  const executeAITurn = (currentState: GameState) => {
    const player = currentState.players.find(p => p.id === myPlayerId);
    const aiPlayer = currentState.players.find(p => p.isBot);

    if (!player || !player.board || !aiPlayer) return;

    // AI selects shot
    const coord = ai.selectShot(10);

    // Process AI shot
    const result = processShot(player.board, coord);
    ai.recordShot(coord, result.hit, result.sunk || false);

    // Update game state
    const updatedState = { ...currentState };
    const playerIndex = updatedState.players.findIndex(p => p.id === myPlayerId);
    if (playerIndex !== -1 && updatedState.players[playerIndex].board) {
      updatedState.players[playerIndex].board = player.board;
    }

    // Check for AI win
    if (isFleetDestroyed(player.board)) {
      setWinner(aiPlayer.username);
      return;
    }

    // Switch turn back to player
    updatedState.currentTurn = myPlayerId;
    setGameState(updatedState);
  };

  if (winner) {
    const isWinner = gameState?.players.find(p => p.id === myPlayerId)?.username === winner;
    return (
      <main
        className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
        style={{backgroundImage: 'url(https://i.redd.it/1zv50khhm0ia1.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
      >
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="text-center relative z-10 max-w-2xl">
          <div className={`text-8xl mb-6 animate-bounce ${isWinner ? "" : "animate-pulse"}`}>
            {isWinner ? "🎉" : "💥"}
          </div>

          <h1 className={`text-7xl font-black mb-6 tracking-tight ${
            isWinner
              ? "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 drop-shadow-[0_0_40px_rgba(74,222,128,0.5)]"
              : "text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 drop-shadow-[0_0_40px_rgba(248,113,113,0.5)]"
          }`}>
            {isWinner ? "VICTORY!" : "DEFEAT"}
          </h1>

          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-8 rounded-2xl border-2 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.3)] mb-8">
            <p className="text-3xl font-bold text-cyan-400 mb-2">
              {winner}
            </p>
            <p className="text-xl text-gray-300">
              {isWinner ? "Dominated the seas!" : "Sank your fleet!"}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white text-lg font-bold transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
            >
              ⚓ New Battle
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-xl text-white text-lg font-bold transition-all transform hover:scale-105"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!gameState) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading match...</p>
        </div>
      </main>
    );
  }

  const me = gameState.players.find(p => p.id === myPlayerId);
  const opponent = gameState.players.find(p => p.id !== myPlayerId);

  if (!me || !opponent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <p className="text-xl text-red-400">Error: Player not found</p>
      </main>
    );
  }

  const myBoard = me.board || createEmptyBoard(10);
  const opponentBoard = opponent.board || createEmptyBoard(10);
  const isMyTurn = gameState.currentTurn === myPlayerId;

  if (placing) {
    const fleet = getFleetForCountry(me.country);

    return (
      <main
        className="h-screen p-3 relative overflow-hidden flex items-center justify-center"
        style={{backgroundImage: 'url(https://i.redd.it/1zv50khhm0ia1.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="max-w-7xl w-full relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            ⚓ Deploy Fleet
          </h1>

          <div className="grid lg:grid-cols-[400px_1fr] gap-4 items-start">
            {/* Left: Ship Selection */}
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-4 rounded-xl border-2 border-blue-500/40 max-h-[85vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-3 text-center text-cyan-400">Select Ships</h3>

              <div className="space-y-2 mb-4">
                {fleet.map((vessel, idx) => {
                  const isPlaced = placementState.placements.some(p => p.kind === vessel.kind);
                  const isSelected = selectedShipIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!isPlaced) setSelectedShipIndex(idx);
                      }}
                      disabled={isPlaced}
                      className={`w-full p-2 rounded-lg border-2 transition-all text-left ${
                        isPlaced
                          ? "bg-slate-800/50 border-green-500/50 opacity-50"
                          : isSelected
                          ? "bg-blue-600/30 border-cyan-400"
                          : "bg-slate-800 border-slate-600 hover:border-blue-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <div className="font-semibold text-blue-300">{vessel.kind.toUpperCase()}</div>
                          <div className="text-gray-400">{vessel.name}</div>
                        </div>
                        {isPlaced && <span className="text-green-400">✓</span>}
                      </div>
                      <div className="mt-1 flex gap-1">
                        {Array.from({ length: vessel.length }).map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded ${isPlaced ? "bg-green-600/50" : "bg-blue-700"}`} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedShipIndex !== null && (
                <button
                  onClick={() => setRotation(prev => prev === "horizontal" ? "vertical" : "horizontal")}
                  className="w-full mb-3 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold text-sm"
                >
                  🔄 {rotation}
                </button>
              )}

              <div className="space-y-2">
                {placementState.placements.length === fleet.length && (
                  <button
                    onClick={() => handlePlaceShips(placementState.placements)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold"
                  >
                    ✓ Start Battle
                  </button>
                )}

                <button
                  onClick={() => {
                    const ships = fleet.map(vessel => ({ kind: vessel.kind, vessel }));
                    const randomPlacements = generateRandomPlacement(10, ships);
                    setPlacementState({ placements: randomPlacements, onCellClick: () => {} });
                    handlePlaceShips(randomPlacements);
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold text-sm"
                >
                  🎲 Random
                </button>

                {placementState.placements.length > 0 && (
                  <button
                    onClick={() => {
                      setPlacementState({ placements: [], onCellClick: () => {} });
                      setSelectedShipIndex(null);
                    }}
                    className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg font-semibold text-sm"
                  >
                    Clear
                  </button>
                )}

                <p className="text-xs text-center text-gray-400 mt-2">
                  {placementState.placements.length}/{fleet.length} placed
                </p>
              </div>
            </div>

            {/* Right: Battle Grid */}
            <div
              className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-4 rounded-xl border-2 border-blue-500/40 flex items-center justify-center"
              onMouseLeave={() => setHoverCoord(null)}
            >
              <div
                onMouseMove={(e) => {
                  if (selectedShipIndex === null) return;
                  const target = e.target as HTMLElement;
                  const cell = target.closest('[data-coord]');
                  if (cell) {
                    const coord = cell.getAttribute('data-coord') as Coord;
                    setHoverCoord(coord);
                  }
                }}
              >
                <Board
                  board={{...myBoard, ships: placementState.placements}}
                  isOwn={true}
                  onCellClick={(coord) => handleShipPlacementClick(coord, fleet)}
                  hoverPreview={
                    selectedShipIndex !== null
                      ? {
                          coord: hoverCoord,
                          length: fleet[selectedShipIndex].length,
                          rotation
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          Naval Warfare
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Your board */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-bold text-center mb-4 text-blue-300">
                Your Waters - {me.username}
              </h2>
              <Board board={myBoard} isOwn={true} />
            </div>
          </div>

          {/* Right: Controls & Opponent */}
          <div className="space-y-6">
            <HUD
              isYourTurn={isMyTurn}
              currentPlayer={opponent.username}
              onFireShot={handleFireShot}
              gameStatus={gameState.status}
            />

            <OpponentMini
              board={opponentBoard}
              opponentName={opponent.username}
              onCellClick={isMyTurn ? handleFireShot : undefined}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
