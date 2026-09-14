# 🚀 FREE ONLINE DEPLOYMENT GUIDE (GitHub + Render)

This guide walks you step-by-step through hosting the **Connection Game** online 100% free with SSL HTTPS, real-time WebSockets, audio engine, host controller, and Smart Board display.

---

## 📋 Overview of Architecture

- **Code Repository**: GitHub (Free Public or Private repository)
- **Hosting Platform**: [Render](https://render.com) (Free Tier Web Service)
- **Single Full-Stack Service**: The Express Node.js server automatically serves the compiled React Vite frontend (`client/dist`), manages real-time Socket.IO synchronization, and persists game data.

---

## 🛠️ Step 1: Push Your Code to GitHub

### 1.1 Create a New GitHub Repository
1. Open your browser and go to [github.com](https://github.com).
2. Log in and click the **`+`** (Plus) button in the top-right corner, then click **New repository**.
3. Name your repository (for example: `connection-game`).
4. Choose **Public** or **Private** (both work on Render).
5. Leave all boxes unchecked (do **NOT** check "Add a README", .gitignore, or license — our project already has `.gitignore` configured).
6. Click **Create repository**.
7. Copy the repository URL (e.g., `https://github.com/your-username/connection-game.git`).

### 1.2 Push Your Local Project to GitHub
Open your terminal (PowerShell or Command Prompt) in `d:\connection` and run:

```bash
# 1. Initialize git
git init

# 2. Add all project files
git add .

# 3. Commit the changes
git commit -m "Initial commit - Connection Game with Bilingual & Smart Board features"

# 4. Set the main branch
git branch -M main

# 5. Link to your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/your-username/connection-game.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🌐 Step 2: Deploy Free on Render

### 2.1 Sign Up / Log In to Render
1. Visit [https://render.com](https://render.com) and click **Get Started** or **Sign In**.
2. Sign in using your **GitHub** account so Render can access your repositories.

### 2.2 Option A — Instant 1-Click Blueprint Deploy (Recommended)
Because the repository contains `render.yaml`, Render can configure everything automatically:
1. In the Render Dashboard, click **New +** in the top navigation bar.
2. Select **Blueprint**.
3. Connect your `connection-game` repository.
4. Render will detect `render.yaml` and pre-fill:
   - **Service Name**: `connection-game`
   - **Runtime**: `Node`
   - **Plan**: `Free`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Click **Apply**.

---

### 2.3 Option B — Manual Web Service Setup (Alternative)
If you prefer manual setup:
1. In the Render Dashboard, click **New +** -> **Web Service**.
2. Select your `connection-game` GitHub repository and click **Connect**.
3. Fill in the deployment settings:
   - **Name**: `connection-game` (or your custom name)
   - **Region**: Choose the closest region (e.g., `Singapore` for Asia or `Oregon` for US)
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** ($0 / month)
4. Scroll down to **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `HOST_AUTH_PIN` = `1234` *(or your custom host login PIN)*
   - `STORAGE_TYPE` = `json`
5. Click **Deploy Web Service**.

---

## ⏳ Step 3: Build & Deployment Process

Render will now run the build:
1. It runs `postinstall` to install server and client dependencies.
2. It executes `npm run build` inside `client/` to compile Vite assets into `client/dist`.
3. It launches `node server/server.js`.
4. Within 2–3 minutes, the status will show a green **Live** badge.

Your live URL will look like:
👉 `https://connection-game-xxxx.onrender.com`

---

## 🎮 Step 4: Connecting the Host and the Smart Board in the Hall

### For the Projector / Smart Board (Full View)
1. Open Chrome/Edge on the Smart Board or projector laptop.
2. Navigate to:
   ```
   https://connection-game-xxxx.onrender.com/display
   ```
3. Press **F11** to toggle Full-Screen mode.
4. Click the yellow **"🔊 TAP TO UNLOCK AUDIO"** button once at the start so audio sound effects and Tamil/English voice synthesis are permitted by browser security.

### For the Host / Quiz Master Laptop
1. Open your laptop and go to:
   ```
   https://connection-game-xxxx.onrender.com/host
   ```
2. Enter your host PIN (`1234` by default).
3. You now have full control:
   - **Landing Page Mode**: Show college/department details and start countdown.
   - **Questions & Clues**: Start Round 1 / Round 2 / Tie Breaker, reveal clues 1-by-1, trigger Tamil/English TTS voice clues.
   - **Auto-Timer**: When questions advance, timer auto-runs and notifies host.
   - **Mini TV Preview**: Resizeable live mirror window of the Smart Board display.
   - **Winner Celebration**: Trigger celebration mode with custom audio and fireworks.

---

## 💡 Pro-Tips for Render Free Tier

1. **Free Tier Sleep/Wakeup**: Free Render instances spin down after 15 minutes of inactivity. When you open the website after inactivity, it may take ~45 seconds to wake up. Once awake, performance is instant and real-time.
2. **Pre-warming before Event**: 10 minutes before your live quiz competition starts, open both the `/host` and `/display` URLs once so the server is fully warm and active.
3. **Keep-Alive (Optional)**: If you want to prevent sleep during a 3-hour college event, you can use a free monitoring service like [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) to ping `https://your-service.onrender.com/api/health` every 10 minutes.
