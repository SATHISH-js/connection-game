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
const BACKUP_FILE = path.join(DATA_DIR, 'store.backup.json');

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

// Self-healing check to ensure teams, rounds, and settings are never empty or lost
function ensureDataIntegrity() {
  let modified = false;

  // 1. Ensure teams exist
  if (!Array.isArray(memoryStore.teams) || memoryStore.teams.length === 0) {
    memoryStore.teams = JSON.parse(JSON.stringify(seedTeams));
    modified = true;
  }

  // 2. Ensure questions exist
  if (!Array.isArray(memoryStore.questions) || memoryStore.questions.length === 0) {
    memoryStore.questions = JSON.parse(JSON.stringify(seedQuestions));
    modified = true;
  } else {
    // Check each round: if any round has 0 questions, merge fallback questions for that round
    [1, 2, 3].forEach(roundNum => {
      const count = memoryStore.questions.filter(q => q.round === roundNum).length;
      if (count === 0) {
        const roundFallbacks = seedQuestions.filter(q => q.round === roundNum);
        if (roundFallbacks.length > 0) {
          memoryStore.questions.push(...JSON.parse(JSON.stringify(roundFallbacks)));
          modified = true;
        }
      }
    });
  }

  // 3. Ensure settings
  if (!memoryStore.settings || Object.keys(memoryStore.settings).length === 0) {
    memoryStore.settings = JSON.parse(JSON.stringify(seedSettings));
    modified = true;
  }

  // 4. Ensure gameState
  if (!memoryStore.gameState || Object.keys(memoryStore.gameState).length === 0) {
    memoryStore.gameState = JSON.parse(JSON.stringify(initialGameState));
    modified = true;
  }

  if (modified) {
    saveJsonStore();
  }
}

// Load or initialize JSON store
function initJsonStore() {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      ensureDataIntegrity();
    } catch (err) {
      console.warn('⚠️ Could not parse store.json, checking backup file...', err.message);
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const backupRaw = fs.readFileSync(BACKUP_FILE, 'utf-8');
          memoryStore = JSON.parse(backupRaw);
          ensureDataIntegrity();
          console.log('✅ Successfully restored data from store.backup.json');
          return;
        } catch (backupErr) {
          console.warn('⚠️ Backup file also corrupted. Re-seeding store.');
        }
      }
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
    const jsonStr = JSON.stringify(memoryStore, null, 2);
    fs.writeFileSync(STORE_FILE, jsonStr, 'utf-8');
    // Save redundant backup file for data safety
    fs.writeFileSync(BACKUP_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err);
  }
}

async function initStorage() {
  const mongoUri = process.env.MONGODB_URI;

  // If MONGODB_URI is not explicitly configured, DISCONNECT MongoDB and immediately use Render JSON storage
  if (!mongoUri || !mongoUri.trim()) {
    isMongoConnected = false;
    console.log('⚡ Render Local JSON Database active (store.json). MongoDB is disconnected.');
    initJsonStore();
    return;
  }

  try {
    // Only attempt MongoDB connection when MONGODB_URI is provided
    await mongoose.connect(mongoUri.trim(), {
      serverSelectionTimeoutMS: 5000
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
    console.log('ℹ️ MongoDB connection failed (' + err.message + '). Switching to Render local JSON storage.');
    initJsonStore();
  }
}

function buildIdQuery(id) {
  if (!id) return { id: '__invalid__' };
  const strId = String(id);
  const isValidObjectId = mongoose.Types.ObjectId.isValid(strId) && strId.length === 24;
  return isValidObjectId ? { $or: [{ id: strId }, { _id: strId }] } : { id: strId };
}

function matchMemoryItem(item, id) {
  if (!item || !id) return false;
  const strId = String(id);
  return String(item.id) === strId || (item._id && String(item._id) === strId);
}

const storage = {
  isMongo: () => isMongoConnected,

  getDbStatus() {
    const mongoUri = process.env.MONGODB_URI || '';
    const isConfigured = Boolean(mongoUri && mongoUri.trim() !== '');
    const isAtlas = mongoUri.includes('mongodb.net');
    return {
      connected: isMongoConnected,
      mode: isMongoConnected ? 'mongodb' : 'local_json',
      databaseType: isMongoConnected ? (isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB (Local)') : 'Render Local JSON Persistence (store.json)',
      isPersistentOnRender: true,
      mongoUriConfigured: isConfigured,
      message: isMongoConnected
        ? 'Connected to permanent MongoDB Atlas cloud database.'
        : 'Running on Render Local JSON database (store.json) with redundant backup protection (store.backup.json). Questions and teams are tracked and persisted.'
    };
  },

  // Teams
  async getTeams() {
    if (isMongoConnected) {
      return await Team.find().sort({ totalScore: -1, teamNumber: 1 }).lean();
    }
    if (!memoryStore.teams || memoryStore.teams.length === 0) {
      memoryStore.teams = JSON.parse(JSON.stringify(seedTeams));
      saveJsonStore();
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
      const targetRound = Number(round);
      list = list.filter(q => q.round === targetRound);
      if (list.length === 0) {
        // Self-heal: load fallback seed questions for this round
        const fallbacks = seedQuestions.filter(q => q.round === targetRound);
        if (fallbacks.length > 0) {
          memoryStore.questions.push(...JSON.parse(JSON.stringify(fallbacks)));
          saveJsonStore();
          list = memoryStore.questions.filter(q => q.round === targetRound);
        }
      }
    }
    return list.sort((a, b) => a.round - b.round || a.questionNumber - b.questionNumber);
  },

  async getQuestion(id) {
    if (isMongoConnected) {
      return await Question.findOne(buildIdQuery(id)).lean();
    }
    return memoryStore.questions.find(q => matchMemoryItem(q, id)) || null;
  },

  async createQuestion(questionData) {
    if (!questionData.id) {
      questionData.id = 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    if (isMongoConnected) {
      return await Question.create(questionData);
    }
    memoryStore.questions.push(questionData);
    saveJsonStore();
    return questionData;
  },

  async updateQuestion(id, updates) {
    if (isMongoConnected) {
      return await Question.findOneAndUpdate(buildIdQuery(id), { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.questions.findIndex(q => matchMemoryItem(q, id));
    if (idx !== -1) {
      memoryStore.questions[idx] = { ...memoryStore.questions[idx], ...updates, updatedAt: new Date() };
      saveJsonStore();
      return memoryStore.questions[idx];
    }
    return null;
  },

  async deleteQuestion(id) {
    if (isMongoConnected) {
      return await Question.findOneAndDelete(buildIdQuery(id));
    }
    const idx = memoryStore.questions.findIndex(q => matchMemoryItem(q, id));
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
  },

  async exportData() {
    if (isMongoConnected) {
      const questions = await Question.find().sort({ round: 1, questionNumber: 1 }).lean();
      const teams = await Team.find().sort({ teamNumber: 1 }).lean();
      const settings = await GameSetting.findOne({ key: 'global_settings' }).lean();
      return { questions, teams, settings, exportedAt: new Date() };
    }
    return {
      questions: memoryStore.questions,
      teams: memoryStore.teams,
      settings: memoryStore.settings,
      gameState: memoryStore.gameState,
      exportedAt: new Date()
    };
  },

  async importQuestions(newQuestions = []) {
    if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
      throw new Error('Invalid questions data: array of questions is required');
    }
    if (isMongoConnected) {
      await Question.deleteMany({});
      await Question.insertMany(newQuestions);
    } else {
      memoryStore.questions = JSON.parse(JSON.stringify(newQuestions));
      saveJsonStore();
    }
    return memoryStore.questions;
  }
};

module.exports = {
  initStorage,
  storage
};
