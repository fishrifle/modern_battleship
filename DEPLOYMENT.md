# Deployment Guide

## Quick Deploy (Recommended)

### 1. Deploy Socket.IO Server to Render

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `battleship-socket-server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run server`
   - **Plan**: Free
5. Click "Create Web Service"
6. Copy your Render URL (e.g., `https://battleship-socket-server.onrender.com`)

### 2. Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up/login
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Environment Variables**:
     - `NEXT_PUBLIC_SOCKET_URL` = `https://your-render-url.onrender.com` (from step 1)
     - `DATABASE_URL` = `file:./prisma/prod.db`
5. Click "Deploy"

### 3. Done!

Your game is live at: `https://your-project.vercel.app`

---

## Alternative: Railway (One Command Deploy)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy both services
railway up
```

Then set environment variables in Railway dashboard.

---

## Alternative: Single Server Deploy (Simpler but Less Scalable)

If you want to run everything on one server:

### Deploy to Render/Railway/Fly.io

1. Update `package.json`:
```json
"scripts": {
  "start": "node start-all.js"
}
```

2. Create `start-all.js`:
```javascript
const { spawn } = require('child_process');

// Start Socket.IO server
const socketServer = spawn('npm', ['run', 'server']);
socketServer.stdout.on('data', data => console.log(`[Socket] ${data}`));

// Start Next.js
const nextServer = spawn('npm', ['run', 'start:next']);
nextServer.stdout.on('data', data => console.log(`[Next] ${data}`));
```

3. Update scripts:
```json
"start:next": "next start -p 3000",
"start": "node start-all.js"
```

This runs both on the same dyno but is less scalable.

---

## Environment Variables

### Production (.env.production)
```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-url.com
DATABASE_URL="file:./prisma/prod.db"
```

### For Render (Socket Server)
- `NODE_ENV=production`
- `DATABASE_URL=file:./prisma/prod.db`

### For Vercel (Frontend)
- `NEXT_PUBLIC_SOCKET_URL=https://your-render-url.onrender.com`

(Note: DATABASE_URL is only needed in .env for Prisma, not in Vercel env vars)

---

## Notes

- **Free Tier Limitations**: Render/Railway free tier may sleep after inactivity
- **Database**: Using SQLite for simplicity. For production, consider PostgreSQL
- **WebSockets**: Ensure your hosting supports WebSocket connections
- **CORS**: Already configured to accept all origins (`*`)
