const { v4: uuidv4 } = require('uuid');
const { storage } = require('../services/storage');
const { broadcastStateChange, broadcastScoreUpdate } = require('../socket/gameSocket');

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await storage.getTeams();
    res.json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await storage.getTeam(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { teamName, character, characterName, members, collegeName } = req.body;
    if (!teamName) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    const allTeams = await storage.getTeams();
    const nextNumber = allTeams.length > 0 ? Math.max(...allTeams.map(t => t.teamNumber || 0)) + 1 : 1;

    const newTeam = {
      teamId: `team-${uuidv4().substring(0, 8)}`,
      teamNumber: nextNumber,
      teamName: teamName.trim(),
      character: character || '🦁',
      characterName: characterName || 'Lion',
      collegeName: collegeName ? String(collegeName).trim() : '',
      members: Array.isArray(members) ? members : (members ? members.split(',').map(m => m.trim()) : []),
      round1Score: 0,
      round2Score: 0,
      tieBreakerScore: 0,
      totalScore: 0,
      createdAt: new Date()
    };

    const saved = await storage.createTeam(newTeam);
    broadcastStateChange();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { teamName, character, characterName, members, collegeName } = req.body;
    const updates = {};
    if (teamName !== undefined) updates.teamName = teamName.trim();
    if (character !== undefined) updates.character = character;
    if (characterName !== undefined) updates.characterName = characterName;
    if (collegeName !== undefined) updates.collegeName = String(collegeName).trim();
    if (members !== undefined) {
      updates.members = Array.isArray(members) ? members : members.split(',').map(m => m.trim());
    }

    const updated = await storage.updateTeam(req.params.id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Team not found' });

    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const deleted = await storage.deleteTeam(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });

    broadcastStateChange();
    res.json({ success: true, message: 'Team removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTeamScore = async (req, res) => {
  try {
    const { delta, round, directScore } = req.body;
    const updated = await storage.updateTeamScore(req.params.id, {
      delta,
      round: Number(round) || 1,
      directScore
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Team not found' });

    try {
      const { Score } = require('../models');
      if (storage.isMongo()) {
        await Score.create({
          teamId: req.params.id,
          round: Number(round) || 1,
          pointsDelta: delta !== undefined ? delta : 0,
          newScore: updated.totalScore,
          reason: directScore !== undefined ? 'Direct Score Set' : 'Delta Adjustment'
        });
      }
    } catch (scoreLogErr) {
      // Score audit logging is non-blocking
    }

    broadcastScoreUpdate(updated);
    broadcastStateChange();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetAllScores = async (req, res) => {
  try {
    const teams = await storage.getTeams();
    for (const team of teams) {
      await storage.updateTeam(team.teamId, {
        round1Score: 0,
        round2Score: 0,
        tieBreakerScore: 0,
        totalScore: 0
      });
    }
    broadcastStateChange();
    res.json({ success: true, message: 'All team scores reset to 0' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
