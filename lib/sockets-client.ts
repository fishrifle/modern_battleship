"use client";

import { io, Socket } from "socket.io-client";
import type { Coord, Placement } from "./types";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const sock = getSocket();
  if (!sock.connected) {
    sock.connect();
  }
  return sock;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

// Event emitters
export function joinQueue(userId: string, username: string, wantAI: boolean = false): void {
  const sock = connectSocket();
  sock.emit("match:queue", { userId, username, wantAI });
}

export function leaveQueue(): void {
  const sock = getSocket();
  sock.emit("match:leave");
}

export function placeShips(matchId: string, userId: string, placements: Placement[]): void {
  const sock = getSocket();
  sock.emit("match:place", { matchId, userId, placements });
}

export function fireShot(matchId: string, userId: string, targetId: string, coord: Coord): void {
  const sock = getSocket();
  sock.emit("match:fire", { matchId, userId, targetId, coord });
}

export function createPrivateRoom(userId: string, username: string): void {
  const sock = connectSocket();
  sock.emit("room:create", { userId, username });
}

export function joinPrivateRoom(userId: string, username: string, roomCode: string): void {
  const sock = connectSocket();
  sock.emit("room:join", { userId, username, roomCode });
}
