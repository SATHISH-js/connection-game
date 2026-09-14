const mongoose = require('mongoose');

const HostSchema = new mongoose.Schema({
  username: { type: String, default: 'host', unique: true },
  pin: { type: String, default: '1234' },
  role: { type: String, default: 'admin' },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Host', HostSchema);
