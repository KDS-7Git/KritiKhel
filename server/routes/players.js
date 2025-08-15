// filepath: d:\WebDev\Janmashtami\games-website\server\routes\players.js
const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// @route   POST /api/players/register
// @desc    Register a new player or update an existing one
// @access  Public
router.post('/register', async (req, res) => {
  const { name, rollNumber, phone } = req.body;

  // Basic validation
  if (!name || !rollNumber || !phone) {
    return res.status(400).json({ message: 'Please provide name, roll number, and phone.' });
  }

  try {
    const playerFields = { name, phone };

    // Find player by roll number and update, or create if it doesn't exist (upsert)
    const player = await Player.findOneAndUpdate(
      { rollNumber: rollNumber.toUpperCase() },
      { $set: playerFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(player);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

module.exports = router;