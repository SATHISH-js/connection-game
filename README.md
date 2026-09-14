# ⚡ CONNECTION GAME — Live Host & Display System

> **"Think. Connect. Win."**  
> A complete, production-quality, responsive web application engineered for college symposiums and live auditorium quiz competitions.

---

## 🌟 Overview & Architecture

The system operates in **two completely distinct modes** communicating in real time over **Socket.IO**:

```
           +---------------------------------------------+
           |           HOST LAPTOP (Coordinator)         |
           |                  URL: /host                 |
           +----------------------+----------------------+
                                  |
                        HTTP POST / Socket.IO
                                  v
           +---------------------------------------------+
           |         EXPRESS + SOCKET.IO SERVER          |
           |             Port 5000 (0.0.0.0)             |
           |     Central Game State & Server Clock       |
           |   Dual Storage: MongoDB + JSON Fallback     |
           +----------------------+----------------------+
                                  |
                            Socket.IO Events
                                  v
           +---------------------------------------------+
           |       SMART BOARD / PROJECTOR / TV          |
           |                URL: /display                |
           |          1080p / 4K Clean View              |
           |      Web Audio Synthesizer + Confetti       |
           +---------------------------------------------+
```

1. **HOST / MANAGE MODE (`/host`)**: Event coordinators control the entire flow—timer, question step, clue reveal, audio triggers, tie-breaker, and live score editing.
2. **DISPLAY MODE (`/display`)**: Clean, distraction-free, 4K/1080p Smart Board presentation mode. Contains no admin buttons or controls. Shows clue cards, massive synchronized timer, dramatic answer reveal curtain, rotating leaderboard, Olympic podium, and champion confetti celebration.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ installed.
- (Optional) **MongoDB**; if MongoDB is not running, the application automatically activates the **local JSON database fallback** (`server/data/store.json`) with zero configuration!

### Option A: Unified One-Click Run (Recommended)
From the root directory (`d:\connection`):

```bash
# 1. Start backend server (includes built frontend on port 5000)
cd server
node server.js
```

Then open:
- **Host Laptop**: [http://localhost:5000/host](http://localhost:5000/host) (Default PIN: `1234`)
- **Smart Board / Display**: [http://localhost:5000/display](http://localhost:5000/display)

### Option B: Separate Development Mode (Vite HMR)
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

Then open:
- **Host Laptop**: [http://localhost:3000/host](http://localhost:3000/host) (Default PIN: `1234`)
- **Smart Board / Display**: [http://localhost:3000/display](http://localhost:3000/display)

---

## 📡 Smart Board & Local Wi-Fi (LAN) Setup

Follow these steps on event day in your auditorium or symposium venue:

1. **Connect both devices to the same Wi-Fi network**:
   Connect the **Host laptop** and the **Smart Board / Projector PC** to the same venue router or mobile hotspot.
2. **Find the Host Laptop's Local IP Address**:
   When you start `node server.js`, the server automatically detects and prints your LAN address in the terminal:
   ```
   ============================================================
   ⚡ CONNECTION GAME — HOST + DISPLAY ENGINE IS RUNNING
   ============================================================
   📡 Backend Server listening on: http://0.0.0.0:5000
   📲 LAN Smart Board Access:     http://192.168.1.150:3000/display
   💻 LAN Host Laptop Access:     http://192.168.1.150:3000/host
   ============================================================
   ```
3. **Open Display on Smart Board**:
   On the Smart Board browser, navigate to:
   `http://<laptop-ip>:3000/display` (or `http://<laptop-ip>:5000/display`)
4. **Open Host Mode on Coordinator Laptop**:
   On your coordinator laptop, navigate to:
   [http://localhost:3000/host](http://localhost:3000/host)
5. **Verify Connection**:
   The Host header will immediately display `🟢 DISPLAY CONNECTED (1)`.
6. **Enable Audio on Smart Board**:
   Because browsers restrict audio autoplay, click the **"🔊 ENABLE GAME AUDIO"** banner on the Smart Board once before starting the match.
7. **Toggle Fullscreen**:
   Press **`F`** on the Smart Board or click the **Fullscreen** button in the header.

---

## 🎮 Core Game Rules & 3-Round Structure

The game features exactly 3 rounds:

- **ROUND 1: Normal Connection Round**  
  Standard multi-clue connection questions (Apple, Newton, Falling, Orbit $\rightarrow$ Gravity). Points: 10 pts.
- **ROUND 2: Normal Connection Round**  
  Round 1 scores carry forward seamlessly. Advanced connection questions.
- **ROUND 3: Tie Breaker Round**  
  Automated tie detection flags tied teams after Round 2. Host launches the dedicated sudden-death arena for the contenders with 20s timers.

---

## 👥 Scalability: 20+, 50+, 100+ Teams

- The application is pre-seeded with **25 diverse teams** with character avatars (🦁 Lion, 🐯 Tiger, 🐼 Panda, 🦊 Fox, 🐺 Wolf, 🦅 Eagle, 🐉 Dragon, etc.).
- **Smart Board Auto-Rotation**:
  To ensure large numbers of teams remain clearly readable on a 1080p/4K screen, the leaderboard displays **10 teams per page** and automatically rotates every 6 seconds (configurable in Host Settings).
- Coordinators can also pause rotation or click Next/Previous page buttons at any time.

---

## 🔊 Audio System & Sound Effects

The application features a built-in **Web Audio API synthesizer** requiring zero external audio file downloads to play crisp, high-impact arcade chimes:

| Effect | Trigger | Sound Description |
|---|---|---|
| **Game Start** | Start Game button | Energetic ascending major brass chords |
| **Question Change** | Next/Previous Question | Futuristic resonant frequency sweep |
| **Timer Start** | Start Timer | Two-tone crystal chime (880Hz $\rightarrow$ 1320Hz) |
| **Countdown** | Last 5–10 seconds | High-frequency urgency pips |
| **Time's Up** | Timer hits 0 | Dramatic buzzer & gong sound |
| **Answer Reveal** | Reveal Answer | Ascending pentatonic sparkle shimmer |
| **Correct Answer** | Award positive points | Triumphant major triad celebration |
| **Wrong Answer** | Award negative points | Descending buzz |
| **Leaderboard** | Show Leaderboard | Grand brass fanfare |
| **Tie Breaker** | Launch Round 3 | Suspenseful cinematic drone & chord clash |
| **Winner** | End Game / Crown Champions | Triumphant championship fanfare |

### Spoken Answers & Custom Audio:
- **Text-to-Speech (TTS)**: Built-in browser speech synthesis speaks the official answer out loud upon reveal.
- **File Uploads**: Host can upload custom `.mp3`, `.wav`, or `.ogg` audio files in `/host/audio` or attach them to individual questions.

---

## ⌨️ Host Keyboard Shortcuts

| Key | Action |
|---|---|
| **SPACE** | Start / Pause / Resume Timer |
| **N** | Advance to Next Question |
| **P** | Return to Previous Question |
| **R** | Reset Timer to default (30s) |
| **A** | Reveal Official Answer on Smart Board |
| **H** | Hide Answer Curtain |
| **L** | Toggle Live Leaderboard on Smart Board |
| **F** | Toggle Fullscreen Mode |
| **ESC** | Close Modals / Exit Fullscreen |

---

## 🛡️ Security & Authentication

- Host routes (`/host/*`) and write API endpoints (`POST`, `PUT`, `DELETE`) are protected by the **Host PIN**.
- Default PIN: `1234` (configurable via `HOST_PIN` in `.env` or in Host Settings).
- Display Mode is strictly read-only and cannot execute administrative mutations.

---

## 📂 Application Routes

- `/` : Landing Page ("Think. Connect. Win.")
- `/host-login` : Host PIN Authentication
- `/host` : Host Master Control Desk (Timer, Step, Reveal, Quick Scores)
- `/host/questions` : Question CRUD, Clue Editor, Audio Preview
- `/host/teams` : 20+ Teams Manager, Avatar Selector, Score Adjusters
- `/host/leaderboard` : Host Scoreboard & Smart Board Broadcast Toggle
- `/host/tiebreaker` : Automated Tie Detection & Contender Match Runner
- `/host/audio` : Live Soundboard, Volume Sliders, TTS & MP3 Uploader
- `/host/settings` : Event Name, Timer Durations, Host PIN, Demo Reset
- `/display` : Smart Board / Projector Dedicated View

---

## 🔌 Socket.IO Real-Time Events Reference

| Event Name | Direction | Description |
|---|---|---|
| `gameStateSync` | Server $\rightarrow$ All | Full snapshot of active state, question, timer, teams |
| `gameStarted` | Server $\rightarrow$ Display | Begins the game session |
| `questionChanged` | Server $\rightarrow$ Display | Updates active question and clues |
| `timerStarted` | Server $\rightarrow$ Display | Starts synchronized timer with server timestamp |
| `timerPaused` | Server $\rightarrow$ Display | Pauses countdown |
| `timerResumed` | Server $\rightarrow$ Display | Resumes countdown from remaining seconds |
| `timerReset` | Server $\rightarrow$ Display | Resets timer to specified duration |
| `timerFinished` | Server $\rightarrow$ Display | Triggers "TIME'S UP!" alert and gong sound |
| `answerRevealed` | Server $\rightarrow$ Display | Displays answer curtain, plays audio/TTS |
| `answerHidden` | Server $\rightarrow$ Display | Closes answer curtain |
| `triggerAudioEffect` | Server $\rightarrow$ Display | Plays one of the 11 procedural sound effects |
| `scoreUpdated` | Server $\rightarrow$ All | Broadcasts updated team points |
| `leaderboardUpdated` | Server $\rightarrow$ All | Broadcasts updated rankings |
| `displayConnected` | Server $\rightarrow$ Host | Alerts Host that Smart Board is connected |
| `displayDisconnected` | Server $\rightarrow$ Host | Alerts Host if Smart Board loses connection |
