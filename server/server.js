require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const os = require('os');

const { initStorage } = require('./services/storage');
const { initSocket } = require('./socket/gameSocket');
const { generateDefaultAudioFiles } = require('./utils/audioGenerator');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const questionRoutes = require('./routes/questionRoutes');
const gameRoutes = require('./routes/gameRoutes');
const audioRoutes = require('./routes/audioRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Enable CORS for frontend and Smart Board access over LAN or cloud (Vercel, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-host-pin', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/settings', settingsRoutes);

// System Health & LAN Info endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    time: Date.now(),
    lanIp: getLocalIpAddress(),
    serverPort: PORT,
    clientPort: 3000
  });
});

// Serve frontend build if dist exists
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.IO setup with wildcard CORS for Smart Board
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

// Helper function to detect local network IPv4 address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function start() {
  // Ensure default synthesizer audio files exist in uploads/
  generateDefaultAudioFiles();

  // Initialize storage (MongoDB or local JSON fallback)
  await initStorage();

  // Initialize Socket.IO logic
  initSocket(io);

  server.listen(PORT, '0.0.0.0', () => {
    const lanIp = getLocalIpAddress();
    console.log('\n============================================================');
    console.log('⚡ CONNECTION GAME — HOST + DISPLAY ENGINE IS RUNNING');
    console.log('============================================================');
    console.log(`📡 Backend Server listening on: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Local Host Laptop Access:   http://localhost:3000/host`);
    console.log(`📺 Local Display Smart Board:  http://localhost:3000/display`);
    console.log('------------------------------------------------------------');
    console.log(`📲 LAN Smart Board Access:     http://${lanIp}:3000/display`);
    console.log(`💻 LAN Host Laptop Access:     http://${lanIp}:3000/host`);
    console.log('============================================================\n');
  });
}

start().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
