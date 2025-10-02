# ⚓ Modern Battleship

A modern, real-time multiplayer naval warfare strategy game featuring authentic warships from 15 nations.

## 🚀 Features (In Progress)

### ✅ Completed
- [x] Next.js 15 + TypeScript + Tailwind CSS setup
- [x] Prisma database schema (SQLite)
- [x] 15 real navies with authentic vessels (USA, UK, France, Japan, India, China, Russia, South Korea, Italy, Spain, Germany, Australia, Canada, Turkey, Brazil)
- [x] Core game logic (coordinate system, ship placement validation)
- [x] AI opponent with Hunt/Target algorithm
- [x] Socket.IO server with PvP and PvC matchmaking
- [x] Real-time game state synchronization

### 🚧 In Progress
- [ ] Board UI component with A-J/1-10 coordinate labels
- [ ] Ship placement screen (manual drag-drop + random)
- [ ] Game UI with coordinate callout (type "C11" to fire)
- [ ] Authentication (Clerk or Supabase)
- [ ] Stats tracking and leaderboard
- [ ] Ship graphics/sprites

## 🎮 Gameplay

### Classic Battleship Rules
- **Grid**: 10×10 (A-J columns, 1-10 rows)
- **Fleet**: 5 ships per player
  - Carrier (5 cells)
  - Battleship (4 cells)
  - Cruiser (3 cells)
  - Submarine (3 cells)
  - Destroyer (2 cells)
- **Win Condition**: Sink all enemy ships

### Game Modes
- **PvP**: Play against friends anywhere in the world
- **PvC**: Play against AI opponent

### Coordinate System
- Call out shots like real battleship: **"C11"**, **"B5"**, **"J10"**
- Click cells or type coordinates

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js + Socket.IO
- **Database**: Prisma + SQLite (easily upgradable to PostgreSQL)
- **Auth**: Clerk or Supabase (TBD)
- **Deployment**: Vercel (frontend) + Railway/Render (Socket.IO server)

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development servers
npm run dev          # Next.js (port 3000)
npm run server       # Socket.IO (port 8080)
```

## 🌍 Navies & Ships

Each of the 15 nations has authentic, commissioned vessels:

### 🇺🇸 United States
- USS Gerald R. Ford (CVN-78) - Ford-class carrier
- USS Arleigh Burke (DDG-51) - Arleigh Burke-class destroyer
- USS Ticonderoga (CG-47) - Ticonderoga-class cruiser
- USS Virginia (SSN-774) - Virginia-class submarine
- USS Freedom (LCS-1) - Freedom-class littoral combat ship

### 🇬🇧 United Kingdom
- HMS Queen Elizabeth (R08) - Queen Elizabeth-class carrier
- HMS Daring (D32) - Type 45 destroyer
- HMS Montrose (F236) - Type 23 frigate
- HMS Astute (S119) - Astute-class submarine
- HMS Tamar (P233) - River-class patrol vessel

...and 13 more navies! See `lib/fleets.ts` for the complete list.

## 🎯 Next Steps

1. **Install dependencies**: `npm install`
2. **Build Board component** with labeled grid (A-J, 1-10)
3. **Create ship placement UI** with drag-drop
4. **Implement game screen** with your board + opponent mini-board
5. **Add authentication** for persistent accounts
6. **Deploy to internet** so friends can play from anywhere

## 🗂️ Project Structure

```
modern_battleship/
├── app/                # Next.js App Router pages
│   ├── page.tsx       # Landing/lobby
│   ├── game/[id]/     # Game screen
│   └── globals.css
├── components/         # React components
│   ├── Board.tsx      # Game board with coordinates
│   ├── ShipTray.tsx   # Ship placement UI
│   └── ...
├── lib/               # Core logic
│   ├── game.ts        # Game rules, validation
│   ├── ai.ts          # AI opponent logic
│   ├── fleets.ts      # 15 navies + ships data
│   └── types.ts       # TypeScript interfaces
├── server/            # Socket.IO server
│   └── index.ts
├── prisma/            # Database schema
│   └── schema.prisma
└── public/            # Static assets (ship sprites)
```

## 🔗 Socket.IO Events

### Client → Server
- `match:queue` - Join matchmaking (PvP or PvC)
- `match:place` - Submit ship placement
- `match:fire` - Fire at coordinate

### Server → Client
- `match:found` - Match created
- `match:state` - Game state update
- `shot:result` - Shot result (hit/miss/sunk)
- `match:finished` - Game over

## 📝 License

MIT

---

**Status**: 🏗️ Under active development

**Current Phase**: Core architecture complete, building UI components next
