# ⚓ Modern Battleship

A modern, real-time naval warfare strategy game featuring authentic warships from 15 nations. Built with Next.js 15, TypeScript, and Tailwind CSS.

![Modern Battleship](https://i.redd.it/1zv50khhm0ia1.png)

## 🚀 Features

### ✅ Completed
- **Next.js 15 + TypeScript + Tailwind CSS** - Modern tech stack
- **Offline AI Mode** - Play against intelligent AI opponent
- **15 Real Navies** - Authentic vessels from USA, UK, France, Japan, India, China, Russia, South Korea, Italy, Spain, Germany, Australia, Canada, Turkey, Brazil
- **Manual Ship Placement** - Click to select, rotate, and place ships on grid
- **Hover Preview** - See ship placement before confirming
- **Realistic Ship Visuals** - Naval-styled ship pieces with bow/stern indicators
- **Smart AI Opponent** - Hunt/Target algorithm with parity optimization
- **Turn-Based Gameplay** - Player fires → AI fires → Player fires
- **Hit/Miss Detection** - Visual feedback with 💥 for hits, ○ for misses
- **Ship Sinking** - Automatic detection with ☠️ indicator
- **Win/Lose Screens** - Epic victory/defeat screens
- **Random Placement** - Quick ship deployment option
- **Beautiful UI** - Naval warfare themed with background and animations

## 🎮 How to Play

### 1. Deploy Your Fleet
- **Select a ship** from the left panel
- **Rotate** using the 🔄 button (horizontal/vertical)
- **Hover** over the grid to preview placement
- **Click** on the grid to place the ship
- Repeat for all 5 ships, or use **🎲 Random** for quick setup
- Click **✓ Start Battle** when ready

### 2. Battle Phase
- **Click on opponent's grid** to fire shots
- **AI fires back** automatically after each turn
- **💥 = Hit**, **○ = Miss**, **☠️ = Ship Sunk**
- **Sink all enemy ships** to win!

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Game Logic**: Custom battleship engine with AI
- **Deployment**: Vercel

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

## 🎯 Game Rules

### Classic Battleship
- **Grid**: 10×10 (A-J columns, 1-10 rows)
- **Fleet**: 5 ships per player
  - Carrier (5 cells)
  - Battleship (4 cells)
  - Cruiser (3 cells)
  - Submarine (3 cells)
  - Destroyer (2 cells)
- **Win Condition**: Sink all enemy ships

### AI Behavior
- **Hunt Mode**: Checkerboard pattern for efficiency
- **Target Mode**: After hit, searches adjacent cells
- **Smart Targeting**: Eliminates impossible shots

## 🌍 Available Navies

Each nation features authentic, commissioned vessels:

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

## 🗂️ Project Structure

```
modern_battleship/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing/lobby
│   ├── game/[matchId]/    # Game screen
│   └── globals.css
├── components/            # React components
│   ├── Board.tsx         # Game board with coordinates
│   ├── ShipTray.tsx      # Ship selection UI
│   ├── OpponentMini.tsx  # Opponent board preview
│   └── HUD.tsx           # Game HUD
├── lib/                  # Core logic
│   ├── game.ts          # Game rules, validation
│   ├── ai.ts            # AI opponent logic
│   ├── fleets.ts        # 15 navies + ships data
│   └── types.ts         # TypeScript interfaces
└── public/              # Static assets

```

## 🚢 Ship Placement Controls

- **Click ship** → Select for placement
- **🔄 Rotate** → Toggle horizontal/vertical
- **Hover grid** → Preview placement (cyan glow)
- **Click grid** → Place ship
- **🎲 Random** → Auto-place all ships
- **Clear** → Remove all ships and start over

## 🎨 Visual Features

- **Naval warfare background** - Epic battleship scene
- **Realistic ship pieces** - Metal hull with deck details
- **Bow/stern indicators** - Arrow shows ship direction
- **Hover previews** - Cyan highlight before placement
- **Hit animations** - 💥 explosion effects
- **Sunk ships** - ☠️ skull markers
- **Gradient UI** - Glowing borders and shadows

## 📝 License

MIT

---

**Status**: ✅ Fully Playable

**Current Version**: 1.0.0

**Play Now**: [Modern Battleship](https://modern-battleship.vercel.app)
