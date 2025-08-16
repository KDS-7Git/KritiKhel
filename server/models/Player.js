// filepath: d:\WebDev\Janmashtami\games-website\server\models\Player.js
const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true, // Ensures no two players can have the same roll number
    trim: true,
    uppercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  scores: {
    jumbledWords: { type: Number, default: 0 },
    bubbleChallenge: { type: Number, default: 0 }
  },
  scoreSubmissions: {
    jumbledWords: {
      score: { type: Number, default: 0 },
      submittedAt: { type: Date, default: null }
    },
    bubbleChallenge: {
      score: { type: Number, default: 0 },
      submittedAt: { type: Date, default: null }
    }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Player', PlayerSchema);