export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          ⚓ Modern Battleship
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Command Your Fleet. Dominate The Seas.
        </p>
        <div className="space-y-4">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105">
            Find Match
          </button>
          <br />
          <button className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105">
            Play vs AI
          </button>
        </div>
      </div>
    </main>
  );
}
