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
    localStorage.setItem("selectedCountry", country);
    localStorage.setItem("gameMode", "offline"); // Flag for offline mode

    // Generate a simple match ID and go straight to game
    const matchId = `offline_${Date.now()}`;
    router.push(`/game/${matchId}`);
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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{backgroundImage: 'url(https://i.redd.it/1zv50khhm0ia1.png)'}}
      ></div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwxMzAsMjQ2LDAuMTUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="text-center max-w-lg w-full relative z-10">
        <div className="mb-6">
          <div className="text-6xl mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse">⚓</div>
          <h1 className="text-5xl sm:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] tracking-tight">
            BATTLESHIP
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-cyan-400 tracking-wider">NAVAL WARFARE</p>
        </div>

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
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-8 rounded-2xl border-2 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.4)]">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto shadow-[0_0_20px_rgba(34,211,238,0.6)]"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 mx-auto opacity-20"></div>
            </div>
            <p className="text-xl font-bold text-cyan-300 mb-1">Preparing Battle...</p>
            <p className="text-xs text-gray-400 mb-4">Deploying naval forces</p>
            <button
              onClick={() => setIsSearching(false)}
              className="text-xs text-gray-500 hover:text-cyan-400 transition-colors font-semibold"
            >
              Cancel Mission
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
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border-2 border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.3)] space-y-5">
            <div>
              <label className="block text-left text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                🎖️ Admiral Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/90 border-2 border-slate-700 rounded-lg text-white font-semibold focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-left text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                🌍 Select Navy
              </label>
              <CountryPicker selectedCountry={country} onSelect={setCountry} />
            </div>

            <div className="pt-2">
              <button
                onClick={handleFindMatch}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 rounded-xl text-white text-lg font-black uppercase tracking-wide transition-all transform hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] shadow-[0_0_25px_rgba(59,130,246,0.4)] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-xl">⚔️</span>
                  <span>Deploy Fleet</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
