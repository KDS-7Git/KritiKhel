// filepath: d:\WebDev\Janmashtami\games-website\server\routes\admin.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');
const Player = require('../models/Player');
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/admin/login
// @desc    Validate admin credentials and return JWT
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const adminUsername = process.env.ADMIN_USERNAME || 'kritiAdmin2025';
  const adminPassword = process.env.ADMIN_PASSWORD || 'KrHel@IIT#2025!';
  
  if (username === adminUsername && password === adminPassword) {
    
    // Generate JWT token with expiration
    const jwtToken = jwt.sign(
      { 
        isAdmin: true, 
        username: adminUsername,
        loginTime: new Date().toISOString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );
    
    res.json({ 
      message: 'Authentication successful', 
      token: jwtToken,
      expiresIn: '24h'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// @route   GET /api/admin/players
// @desc    Get all players for admin dashboard
// @access  Private (Admin only)
router.get('/players', adminAuth, async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/players/:rollNumber
// @desc    Update a player's information
// @access  Private (Admin only)
router.put('/players/:rollNumber', adminAuth, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { name, phone, rollNumber: newRollNumber } = req.body;
    
    const updatedPlayer = await Player.findOneAndUpdate(
      { rollNumber },
      { name, phone, rollNumber: newRollNumber },
      { new: true }
    );
    
    if (!updatedPlayer) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({ message: 'Player updated successfully', player: updatedPlayer });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/players/bulk
// @desc    Delete multiple players by roll numbers
// @access  Private (Admin only)
router.delete('/players/bulk', adminAuth, async (req, res) => {
  try {
    const { rollNumbers } = req.body;
    
    if (!rollNumbers || !Array.isArray(rollNumbers) || rollNumbers.length === 0) {
      return res.status(400).json({ message: 'Invalid roll numbers array' });
    }
    
    const result = await Player.deleteMany({ rollNumber: { $in: rollNumbers } });
    
    res.json({ 
      message: `${result.deletedCount} players deleted successfully`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting players:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/players/:rollNumber
// @desc    Delete a player by roll number
// @access  Private (Admin only)
router.delete('/players/:rollNumber', adminAuth, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const deletedPlayer = await Player.findOneAndDelete({ rollNumber });
    
    if (!deletedPlayer) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json({ message: 'Player deleted successfully', player: deletedPlayer });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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