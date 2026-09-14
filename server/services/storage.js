const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { seedTeams, seedQuestions, seedSettings, initialGameState } = require('./seedData');

const Team = require('../models/Team');
const Question = require('../models/Question');
const GameSetting = require('../models/GameSetting');
const GameState = require('../models/GameState');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

let isMongoConnected = false;

// Ensure data folder exists for JSON storage
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory fallback cache
let memoryStore = {
  teams: [],
  questions: [],
  settings: {},
  gameState: {}
};

// Load or initialize JSON store
function initJsonStore() {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
    } catch (err) {
      console.warn('⚠️ Could not parse store.json, re-seeding JSON store.', err.message);
      reseedJsonStore();
    }
  } else {
    reseedJsonStore();
  }
}

function reseedJsonStore() {
  memoryStore = {
    teams: JSON.parse(JSON.stringify(seedTeams)),
    questions: JSON.parse(JSON.stringify(seedQuestions)),
    settings: JSON.parse(JSON.stringify(seedSettings)),
    gameState: JSON.parse(JSON.stringify(initialGameState))
  };
  saveJsonStore();
}

function saveJsonStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err);
  }
}

async function initStorage() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connection_game';
  try {
    // Attempt MongoDB connection (10s timeout for remote Atlas cloud clusters)
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: process.env.MONGODB_URI ? 10000 : 2500
    });
    isMongoConnected = true;
    const safeLogUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('✅ Connected to MongoDB at', safeLogUri);

    // Seed MongoDB if empty
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      console.log('🌱 Seeding MongoDB with initial demo data...');
      await Team.insertMany(seedTeams);
      await Question.insertMany(seedQuestions);
      await GameSetting.create(seedSettings);
      await GameState.create(initialGameState);
      console.log('🌱 MongoDB seeding completed successfully.');
    }
  } catch (err) {
    isMongoConnected = false;
    console.log('ℹ️ MongoDB unavailable (' + err.message + '). Switching to local JSON persistence fallback.');
    initJsonStore();
  }
}

const storage = {
  isMongo: () => isMongoConnected,

  // Teams
  async getTeams() {
    if (isMongoConnected) {
      return await Team.find().sort({ totalScore: -1, teamNumber: 1 }).lean();
    }
    return [...memoryStore.teams].sort((a, b) => b.totalScore - a.totalScore || a.teamNumber - b.teamNumber);
  },

  async getTeam(teamId) {
    if (isMongoConnected) {
      return await Team.findOne({ teamId }).lean();
    }
    return memoryStore.teams.find(t => t.teamId === teamId) || null;
  },

  async createTeam(teamData) {
    if (isMongoConnected) {
      return await Team.create(teamData);
    }
    memoryStore.teams.push(teamData);
    saveJsonStore();
    return teamData;
  },

  async updateTeam(teamId, updates) {
    if (isMongoConnected) {
      return await Team.findOneAndUpdate({ teamId }, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.teams.findIndex(t => t.teamId === teamId);
    if (idx !== -1) {
      memoryStore.teams[idx] = { ...memoryStore.teams[idx], ...updates };
      saveJsonStore();
      return memoryStore.teams[idx];
    }
    return null;
  },

  async deleteTeam(teamId) {
    if (isMongoConnected) {
      return await Team.findOneAndDelete({ teamId });
    }
    const idx = memoryStore.teams.findIndex(t => t.teamId === teamId);
    if (idx !== -1) {
      const removed = memoryStore.teams.splice(idx, 1)[0];
      saveJsonStore();
      return removed;
    }
    return null;
  },

  async updateTeamScore(teamId, { delta, round, directScore }) {
    const team = await this.getTeam(teamId);
    if (!team) return null;

    let r1 = Number(team.round1Score) || 0;
    let r2 = Number(team.round2Score) || 0;
    let r3 = Number(team.tieBreakerScore) || 0;

    if (directScore !== undefined && directScore !== null) {
      if (round === 1) r1 = Number(directScore);
      else if (round === 2) r2 = Number(directScore);
      else if (round === 3) r3 = Number(directScore);
    } else if (delta !== undefined && delta !== null) {
      const change = Number(delta);
      if (round === 1) r1 = Math.max(0, r1 + change);
      else if (round === 2) r2 = Math.max(0, r2 + change);
      else if (round === 3) r3 = Math.max(0, r3 + change);
      else {
        // Default to current game round or total
        r1 = Math.max(0, r1 + change);
      }
    }

    const totalScore = r1 + r2 + r3;
    const updates = {
      round1Score: r1,
      round2Score: r2,
      tieBreakerScore: r3,
      totalScore
    };

    return await this.updateTeam(teamId, updates);
  },

  // Questions
  async getQuestions(round = null) {
    if (isMongoConnected) {
      const query = round ? { round: Number(round) } : {};
      return await Question.find(query).sort({ round: 1, questionNumber: 1 }).lean();
    }
    let list = [...memoryStore.questions];
    if (round) {
      list = list.filter(q => q.round === Number(round));
    }
    return list.sort((a, b) => a.round - b.round || a.questionNumber - b.questionNumber);
  },

  async getQuestion(id) {
    if (isMongoConnected) {
      return await Question.findOne({ id }).lean();
    }
    return memoryStore.questions.find(q => q.id === id) || null;
  },

  async createQuestion(questionData) {
    if (isMongoConnected) {
      return await Question.create(questionData);
    }
    memoryStore.questions.push(questionData);
    saveJsonStore();
    return questionData;
  },

  async updateQuestion(id, updates) {
    if (isMongoConnected) {
      return await Question.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      memoryStore.questions[idx] = { ...memoryStore.questions[idx], ...updates, updatedAt: new Date() };
      saveJsonStore();
      return memoryStore.questions[idx];
    }
    return null;
  },

  async deleteQuestion(id) {
    if (isMongoConnected) {
      return await Question.findOneAndDelete({ id });
    }
    const idx = memoryStore.questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      const removed = memoryStore.questions.splice(idx, 1)[0];
      saveJsonStore();
      return removed;
    }
    return null;
  },

  // Settings
  async getSettings() {
    if (isMongoConnected) {
      let settings = await GameSetting.findOne({ key: 'global_settings' }).lean();
      if (!settings) {
        settings = await GameSetting.create(seedSettings);
      }
      return settings;
    }
    return { ...memoryStore.settings };
  },

  async updateSettings(updates) {
    if (isMongoConnected) {
      return await GameSetting.findOneAndUpdate(
        { key: 'global_settings' },
        { $set: updates },
        { new: true, upsert: true }
      ).lean();
    }
    memoryStore.settings = { ...memoryStore.settings, ...updates, updatedAt: new Date() };
    saveJsonStore();
    return memoryStore.settings;
  },

  // Game State
  async getGameState() {
    if (isMongoConnected) {
      let state = await GameState.findOne({ key: 'active_game_state' }).lean();
      if (!state) {
        state = await GameState.create(initialGameState);
      }
      return state;
    }
    return { ...memoryStore.gameState };
  },

  async updateGameState(updates) {
    if (isMongoConnected) {
      return await GameState.findOneAndUpdate(
        { key: 'active_game_state' },
        { $set: updates },
        { new: true, upsert: true }
      ).lean();
    }
    memoryStore.gameState = { ...memoryStore.gameState, ...updates, updatedAt: new Date() };
    saveJsonStore();
    return memoryStore.gameState;
  },

  async resetGame({ resetScores = true } = {}) {
    const freshState = JSON.parse(JSON.stringify(initialGameState));
    if (isMongoConnected) {
      await GameState.findOneAndUpdate(
        { key: 'active_game_state' },
        { $set: freshState },
        { new: true, upsert: true }
      );
      if (resetScores) {
        // Reset all team scores to 0
        await Team.updateMany({}, {
          $set: { round1Score: 0, round2Score: 0, tieBreakerScore: 0, totalScore: 0 }
        });
      }
    } else {
      memoryStore.gameState = freshState;
      if (resetScores) {
        memoryStore.teams.forEach(t => {
          t.round1Score = 0;
          t.round2Score = 0;
          t.tieBreakerScore = 0;
          t.totalScore = 0;
        });
      }
      saveJsonStore();
    }
    return freshState;
  },

  async reseed() {
    if (isMongoConnected) {
      await Team.deleteMany({});
      await Question.deleteMany({});
      await Team.insertMany(seedTeams);
      await Question.insertMany(seedQuestions);
      await this.resetGame();
    } else {
      reseedJsonStore();
    }
    return true;
  }
};

module.exports = {
  initStorage,
  storage
};
