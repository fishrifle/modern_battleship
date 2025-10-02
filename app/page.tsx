"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket, joinQueue, createPrivateRoom, joinPrivateRoom } from "@/lib/sockets-client";
import CountryPicker from "@/components/CountryPicker";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("USA");
  const [isSearching, setIsSearching] = useState(false);
  const [userId, setUserId] = useState("");
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [createdRoomCode, setCreatedRoomCode] = useState("");

  useEffect(() => {
    // Generate or retrieve userId
    let id = localStorage.getItem("userId");
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("userId", id);
    }
    setUserId(id);

    // Set default username
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      setUsername(`Admiral ${Math.floor(Math.random() * 1000)}`);
    }

    const socket = getSocket();

    socket.on("match:found", ({ matchId }: any) => {
      console.log("Match found:", matchId);
      router.push(`/game/${matchId}`);
    });

    socket.on("room:created", ({ matchId, roomCode }: any) => {
      console.log("Room created:", roomCode);
      setCreatedRoomCode(roomCode);
      setIsSearching(false);
    });

    socket.on("queue:waiting", ({ queueSize }: any) => {
      console.log(`Waiting in queue... (${queueSize} player(s))`);
    });

    return () => {
      socket.off("match:found");
      socket.off("room:created");
      socket.off("queue:waiting");
    };
  }, [router]);

  const handleFindMatch = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    localStorage.setItem("username", username);
    setIsSearching(true);
    joinQueue(userId, username, false);
  };

  const handlePlayAI = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    localStorage.setItem("username", username);
    setIsSearching(true);
    joinQueue(userId, username, true);
  };

  const handleCreateRoom = () => {
    console.log("🎮 handleCreateRoom called");
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    console.log("🎮 Creating room for:", username, "userId:", userId);
    localStorage.setItem("username", username);
    setIsSearching(true);
    createPrivateRoom(userId, username);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    if (!roomCodeInput.trim()) {
      alert("Please enter a room code");
      return;
    }

    localStorage.setItem("username", username);
    setIsSearching(true);
    joinPrivateRoom(userId, username, roomCodeInput.toUpperCase());
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdRoomCode);
    alert("Room code copied!");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          ⚓ Modern Battleship
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Command Your Fleet. Dominate The Seas.
        </p>

        {createdRoomCode ? (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 space-y-4">
            <h2 className="text-2xl font-bold text-green-400">Room Created!</h2>
            <p className="text-gray-300">Share this code with your friend:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-2xl font-mono font-bold text-blue-300">
                {createdRoomCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
              >
                📋 Copy
              </button>
            </div>
            <p className="text-sm text-gray-500">Waiting for your friend to join...</p>
            <button
              onClick={() => setCreatedRoomCode("")}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : isSearching ? (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-700">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-300">Finding opponent...</p>
            <button
              onClick={() => setIsSearching(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : showJoinRoom ? (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 space-y-6">
            <h2 className="text-2xl font-bold">Join Friend's Room</h2>

            <div>
              <label className="block text-left text-sm font-semibold text-gray-300 mb-2">
                Admiral Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-semibold text-gray-300 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-xl text-center focus:border-blue-500 focus:outline-none"
                placeholder="ABC123"
                maxLength={6}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleJoinRoom}
                className="w-full px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
              >
                Join Room
              </button>

              <button
                onClick={() => setShowJoinRoom(false)}
                className="w-full px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-all"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 space-y-6">
            <div>
              <label className="block text-left text-sm font-semibold text-gray-300 mb-2">
                Admiral Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-semibold text-gray-300 mb-2">
                Select Your Navy
              </label>
              <CountryPicker selectedCountry={country} onSelect={setCountry} />
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={handleFindMatch}
                className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
              >
                ⚔️ Find Match
              </button>

              <button
                onClick={handleCreateRoom}
                className="w-full px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
              >
                👥 Play with Friend
              </button>

              <button
                onClick={() => setShowJoinRoom(true)}
                className="w-full px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
              >
                🔗 Join Room
              </button>

              <button
                onClick={handlePlayAI}
                className="w-full px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
              >
                🤖 Play vs AI
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
