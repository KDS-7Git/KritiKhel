// filepath: d:\WebDev\Janmashtami\games-website\server\routes\scores.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

// @route   GET /api/scores
// @desc    Test endpoint for scores route
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Scores API endpoint is working!' });
});

// @route   POST /api/scores/start-game
// @desc    Start a game session and get a session token
// @access  Public
router.post('/start-game', async (req, res) => {
  const { rollNumber, gameId } = req.body;
  
  if (!rollNumber || !gameId) {
    return res.status(400).json({ message: 'Missing rollNumber or gameId.' });
  }

  const validGameIds = ['jumbledWords', 'bubbleChallenge'];
  if (!validGameIds.includes(gameId)) {
    return res.status(400).json({ message: 'Invalid gameId.' });
  }

  try {
    // Verify player exists
    const player = await Player.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (!player) {
      return res.status(404).json({ message: 'Player not found. Please register first.' });
    }

    // Create game session token
    const gameToken = jwt.sign(
      { 
        rollNumber: rollNumber.toUpperCase(),
        gameId,
        startTime: new Date().toISOString(),
        maxScore: Math.min(player.scores[gameId] * 2 + 100, 1000) // Reasonable max based on previous score
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' } // Game session expires in 30 minutes
    );

    res.json({ 
      gameToken,
      message: 'Game session started',
      expiresIn: '30 minutes'
    });

  } catch (error) {
    console.error('Game start error:', error);
    res.status(500).json({ message: 'Server error starting game session.' });
  }
});

// @route   POST /api/scores/submit
// @desc    Submit a score for a specific game (requires game session token)
// @access  Public (but requires valid game token)
router.post('/submit', async (req, res) => {
  const { rollNumber, gameId, score, gameToken } = req.body;

  // --- Validation ---
  if (!rollNumber || !gameId || score === undefined || !gameToken) {
    return res.status(400).json({ message: 'Missing rollNumber, gameId, score, or gameToken.' });
  }

  const validGameIds = ['jumbledWords', 'bubbleChallenge'];
  if (!validGameIds.includes(gameId)) {
    return res.status(400).json({ message: 'Invalid gameId.' });
  }

  try {
    // Verify game session token
    const decoded = jwt.verify(gameToken, process.env.JWT_SECRET);
    
    // Validate token data matches submission
    if (decoded.rollNumber !== rollNumber.toUpperCase() || decoded.gameId !== gameId) {
      return res.status(400).json({ message: 'Game token does not match submission data.' });
    }

    // Check if score is reasonable (basic anti-cheat)
    if (score > decoded.maxScore) {
      return res.status(400).json({ 
        message: `Score too high. Maximum allowed: ${decoded.maxScore}` 
      });
    }

    // Check game session time (basic time validation)
    const gameStartTime = new Date(decoded.startTime);
    const now = new Date();
    const gameTime = (now - gameStartTime) / 1000; // seconds
    
    if (gameTime < 10) { // Game must last at least 10 seconds
      return res.status(400).json({ message: 'Game completed too quickly.' });
    }

    if (gameTime > 1800) { // Game can't last more than 30 minutes
      return res.status(400).json({ message: 'Game session expired.' });
    }

    // --- Find the player ---
    const player = await Player.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (!player) {
      return res.status(404).json({ message: 'Player not found. Please register first.' });
    }

    // --- Check if this is a new high score ---
    const currentScore = player.scores[gameId] || 0;
    const currentSubmissionScore = player.scoreSubmissions?.[gameId]?.score || 0;
    
    if (score > currentScore || score > currentSubmissionScore) {
      // Update both the score and submission tracking
      const scoreField = `scores.${gameId}`;
      const submissionScoreField = `scoreSubmissions.${gameId}.score`;
      const submissionTimeField = `scoreSubmissions.${gameId}.submittedAt`;
      
      const updatedPlayer = await Player.findOneAndUpdate(
        { _id: player._id },
        { 
          $max: { [scoreField]: score },
          $set: { 
            [submissionScoreField]: score,
            [submissionTimeField]: new Date()
          }
        },
        { new: true } // Return the updated document
      );
      
      res.status(200).json(updatedPlayer);
    } else {
      // Score is not higher, just return current player data
      res.status(200).json(player);
    }

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid game token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Game session expired.' });
    }
    console.error('Score submission error:', error);
    res.status(500).json({ message: 'Server error during score submission.' });
  }
});

module.exports = router;