// filepath: d:\WebDev\Janmashtami\games-website\server\routes\admin.js
const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const Player = require('../models/Player');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/admin/export
// @desc    Export all player data as CSV
// @access  Private (Admin only)
router.get('/export', adminAuth, async (req, res) => {
  try {
    const players = await Player.find().lean(); // .lean() for better performance
    const fields = ['name', 'rollNumber', 'phone', 'scores.jumbledWords', 'scores.bubbleChallenge', 'createdAt'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(players);

    res.header('Content-Type', 'text/csv');
    res.attachment('player-data.csv');
    res.send(csv);

  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).send('Server error during CSV export.');
  }
});

module.exports = router;