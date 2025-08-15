// filepath: d:\WebDev\Janmashtami\games-website\server\routes\scores.js
const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// @route   POST /api/scores/submit
// @desc    Submit a score for a specific game
// @access  Public
router.post('/submit', async (req, res) => {
  const { rollNumber, gameId, score } = req.body;

  // --- Validation ---
  if (!rollNumber || !gameId || score === undefined) {
    return res.status(400).json({ message: 'Missing rollNumber, gameId, or score.' });
  }

  const validGameIds = ['jumbledWords', 'bubbleChallenge'];
  if (!validGameIds.includes(gameId)) {
    return res.status(400).json({ message: 'Invalid gameId.' });
  }

  try {
    // --- Find the player ---
    const player = await Player.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (!player) {
      return res.status(404).json({ message: 'Player not found. Please register first.' });
    }

    // --- Use $max to update score only if the new score is higher ---
    const scoreField = `scores.${gameId}`;
    const updatedPlayer = await Player.findOneAndUpdate(
      { _id: player._id },
      { $max: { [scoreField]: score } },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedPlayer);

  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ message: 'Server error during score submission.' });
  }
});

module.exports = router;