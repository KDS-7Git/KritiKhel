// filepath: d:\WebDev\Janmashtami\games-website\server\routes\leaderboard.js
const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// @route   GET /api/leaderboard/:gameId
// @desc    Get top 10 players for a specific game
// @access  Public
router.get('/:gameId', async (req, res) => {
  const { gameId } = req.params;
  const validGameIds = ['jumbledWords', 'bubbleChallenge'];

  if (!validGameIds.includes(gameId)) {
    return res.status(400).json({ message: 'Invalid gameId.' });
  }

  try {
    const sortField = `scores.${gameId}`;
    const leaderboard = await Player.find()
      .sort({ [sortField]: -1 }) // Sort by the game's score in descending order
      .limit(10) // Get top 10 players
      .select(`name rollNumber scores.${gameId}`); // Select only necessary fields

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard.' });
  }
});

module.exports = router;