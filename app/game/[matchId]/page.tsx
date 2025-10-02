"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket, placeShips, fireShot } from "@/lib/sockets-client";
import { GameState, Coord, Placement, Player, BoardState } from "@/lib/types";
import { getFleetForCountry } from "@/lib/fleets";
import { createEmptyBoard } from "@/lib/game";
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

  useEffect(() => {
    const socket = getSocket();

    // Get userId from localStorage (set on homepage)
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/");
      return;
    }
    setMyPlayerId(userId);

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
    placeShips(matchId, myPlayerId, placements);
  };

  const handleFireShot = (coord: Coord) => {
    if (!gameState) return;

    const opponent = gameState.players.find(p => p.id !== myPlayerId);
    if (!opponent) return;

    fireShot(matchId, myPlayerId, opponent.id, coord);
  };

  if (winner) {
    const isWinner = gameState?.players.find(p => p.id === myPlayerId)?.username === winner;
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="text-center">
          <h1 className={`text-6xl font-bold mb-4 ${isWinner ? "text-green-400" : "text-red-400"}`}>
            {isWinner ? "🎉 VICTORY!" : "💥 DEFEAT"}
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            {winner} wins the battle!
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all"
          >
            Return to Lobby
          </button>
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
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Deploy Your Fleet
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ShipTray fleet={fleet} onPlacementComplete={handlePlaceShips} />
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg mb-4">Position your ships and prepare for battle!</p>
                <p className="text-sm">Waiting for opponent...</p>
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
