import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { BattleshipAI } from "../lib/ai";
import {
  processShot,
  isFleetDestroyed,
  validatePlacement,
  createEmptyBoard,
  generateRandomPlacement
} from "../lib/game";
import { Placement, Coord, GameState, Player } from "../lib/types";
import { getFleetForCountry } from "../lib/fleets";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface MatchRoom {
  id: string;
  players: Player[];
  currentTurnIndex: number;
  status: "waiting" | "placing" | "active" | "finished";
  winnerId?: string;
  boardSize: number;
  aiInstances: Map<string, BattleshipAI>;
}

const queue: Array<{ userId: string; username: string; socketId: string }> = [];
const rooms = new Map<string, MatchRoom>();

io.on("connection", (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join matchmaking queue
  socket.on("match:queue", ({ userId, username, wantAI }: {
    userId: string;
    username: string;
    wantAI?: boolean;
  }) => {
    console.log(`${username} joining queue (AI: ${wantAI})`);

    if (wantAI) {
      // Create PvC match
      const matchId = `match_${Date.now()}_${Math.random()}`;
      const aiId = `ai_${Date.now()}`;

      const room: MatchRoom = {
        id: matchId,
        players: [
          { id: userId, username, country: "USA", ready: false },
          { id: aiId, username: "AI Commander", country: "Russia", ready: true, isBot: true },
        ],
        currentTurnIndex: 0,
        status: "waiting",
        boardSize: 10,
        aiInstances: new Map(),
      };

      room.aiInstances.set(aiId, new BattleshipAI());
      rooms.set(matchId, room);

      socket.join(matchId);
      socket.emit("match:found", {
        matchId,
        opponent: { username: "AI Commander", country: "Russia" },
        youAre: "P1",
      });

      console.log(`Created PvC match: ${matchId}`);
    } else {
      // Join PvP queue
      queue.push({ userId, username, socketId: socket.id });

      // Try to match with another player
      if (queue.length >= 2) {
        const p1 = queue.shift()!;
        const p2 = queue.shift()!;

        const matchId = `match_${Date.now()}_${Math.random()}`;

        const room: MatchRoom = {
          id: matchId,
          players: [
            { id: p1.userId, username: p1.username, country: "USA", ready: false },
            { id: p2.userId, username: p2.username, country: "UK", ready: false },
          ],
          currentTurnIndex: 0,
          status: "waiting",
          boardSize: 10,
          aiInstances: new Map(),
        };

        rooms.set(matchId, room);

        // Notify both players
        io.to(p1.socketId).socketsJoin(matchId);
        io.to(p2.socketId).socketsJoin(matchId);

        io.to(p1.socketId).emit("match:found", {
          matchId,
          opponent: { username: p2.username, country: "UK" },
          youAre: "P1",
        });

        io.to(p2.socketId).emit("match:found", {
          matchId,
          opponent: { username: p1.username, country: "USA" },
          youAre: "P2",
        });

        console.log(`Created PvP match: ${matchId} (${p1.username} vs ${p2.username})`);
      } else {
        socket.emit("queue:waiting", { queueSize: queue.length });
      }
    }
  });

  // Leave queue
  socket.on("match:leave", () => {
    const index = queue.findIndex(p => p.socketId === socket.id);
    if (index !== -1) {
      queue.splice(index, 1);
      console.log(`Player left queue`);
    }
  });

  // Set ship placement
  socket.on("match:place", ({ matchId, userId, placements }: {
    matchId: string;
    userId: string;
    placements: Placement[];
  }) => {
    const room = rooms.get(matchId);
    if (!room) {
      socket.emit("error", { code: "MATCH_NOT_FOUND", message: "Match not found" });
      return;
    }

    const player = room.players.find(p => p.id === userId);
    if (!player) {
      socket.emit("error", { code: "PLAYER_NOT_FOUND", message: "Player not found" });
      return;
    }

    // Validate placement
    if (!validatePlacement(room.boardSize, placements)) {
      socket.emit("error", { code: "INVALID_PLACEMENT", message: "Invalid ship placement" });
      return;
    }

    // Set player board
    player.board = createEmptyBoard(room.boardSize);
    player.board.ships = placements;
    player.ready = true;

    console.log(`Player ${player.username} placed ships in match ${matchId}`);

    // Auto-place ships for AI
    for (const p of room.players) {
      if (p.isBot && !p.board) {
        const fleet = getFleetForCountry(p.country);
        const ships = fleet.map(v => ({ kind: v.kind, vessel: v }));
        const aiPlacements = generateRandomPlacement(room.boardSize, ships);

        p.board = createEmptyBoard(room.boardSize);
        p.board.ships = aiPlacements;
        p.ready = true;

        console.log(`AI ${p.username} auto-placed ships`);
      }
    }

    // Check if all players ready
    if (room.players.every(p => p.ready)) {
      room.status = "active";
      io.to(matchId).emit("match:started", { matchId });
      sendGameState(matchId);

      console.log(`Match ${matchId} started`);

      // If AI goes first, make its move
      if (room.players[room.currentTurnIndex].isBot) {
        setTimeout(() => executeAITurn(matchId), 2000);
      }
    } else {
      io.to(matchId).emit("match:state", getPublicGameState(room, userId));
    }
  });

  // Fire shot
  socket.on("match:fire", ({ matchId, userId, targetId, coord }: {
    matchId: string;
    userId: string;
    targetId: string;
    coord: Coord;
  }) => {
    const room = rooms.get(matchId);
    if (!room) {
      socket.emit("error", { code: "MATCH_NOT_FOUND", message: "Match not found" });
      return;
    }

    const currentPlayer = room.players[room.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== userId) {
      socket.emit("error", { code: "NOT_YOUR_TURN", message: "Not your turn" });
      return;
    }

    const target = room.players.find(p => p.id === targetId);
    if (!target || !target.board) {
      socket.emit("error", { code: "INVALID_TARGET", message: "Invalid target" });
      return;
    }

    try {
      const result = processShot(target.board, coord);

      io.to(matchId).emit("shot:result", {
        shooterId: userId,
        targetId,
        coord,
        result,
      });

      console.log(`${currentPlayer.username} fired at ${coord}: ${result.hit ? 'HIT' : 'MISS'}${result.sunk ? ' (SUNK)' : ''}`);

      // Check for win
      if (isFleetDestroyed(target.board)) {
        room.status = "finished";
        room.winnerId = userId;

        io.to(matchId).emit("match:finished", {
          winnerId: userId,
          winnerName: currentPlayer.username,
        });

        console.log(`Match ${matchId} finished - ${currentPlayer.username} wins!`);
        return;
      }

      // Next turn
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
      sendGameState(matchId);

      // If next player is AI, make its move
      if (room.players[room.currentTurnIndex].isBot) {
        setTimeout(() => executeAITurn(matchId), 1500);
      }
    } catch (error: any) {
      socket.emit("error", { code: "INVALID_SHOT", message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    // Remove from queue
    const queueIndex = queue.findIndex(p => p.socketId === socket.id);
    if (queueIndex !== -1) {
      queue.splice(queueIndex, 1);
    }
  });
});

function executeAITurn(matchId: string): void {
  const room = rooms.get(matchId);
  if (!room || room.status !== "active") return;

  const currentPlayer = room.players[room.currentTurnIndex];
  if (!currentPlayer || !currentPlayer.isBot) return;

  const ai = room.aiInstances.get(currentPlayer.id);
  if (!ai) return;

  // Find opponent
  const opponent = room.players.find(p => p.id !== currentPlayer.id);
  if (!opponent || !opponent.board) return;

  const coord = ai.selectShot(room.boardSize);

  try {
    const result = processShot(opponent.board, coord);
    ai.recordShot(coord, result.hit, result.sunk);

    io.to(matchId).emit("shot:result", {
      shooterId: currentPlayer.id,
      targetId: opponent.id,
      coord,
      result,
    });

    console.log(`AI fired at ${coord}: ${result.hit ? 'HIT' : 'MISS'}${result.sunk ? ' (SUNK)' : ''}`);

    // Check for win
    if (isFleetDestroyed(opponent.board)) {
      room.status = "finished";
      room.winnerId = currentPlayer.id;

      io.to(matchId).emit("match:finished", {
        winnerId: currentPlayer.id,
        winnerName: currentPlayer.username,
      });

      console.log(`Match ${matchId} finished - AI wins!`);
      return;
    }

    // Next turn
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
    sendGameState(matchId);
  } catch (error: any) {
    console.error(`AI shot error: ${error.message}`);
  }
}

function sendGameState(matchId: string): void {
  const room = rooms.get(matchId);
  if (!room) return;

  for (const player of room.players) {
    io.to(matchId).emit("match:state", getPublicGameState(room, player.id));
  }
}

function getPublicGameState(room: MatchRoom, forPlayerId: string): any {
  return {
    id: room.id,
    status: room.status,
    currentTurn: room.players[room.currentTurnIndex]?.id,
    players: room.players.map(p => ({
      id: p.id,
      username: p.username,
      country: p.country,
      ready: p.ready,
      isBot: p.isBot,
      board: p.id === forPlayerId ? p.board : {
        size: room.boardSize,
        cells: p.board?.cells || {},
        ships: [], // Hide opponent ships
      },
    })),
  };
}

const PORT = process.env.SOCKET_PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
});
