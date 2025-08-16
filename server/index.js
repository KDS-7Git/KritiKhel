// filepath: d:\WebDev\Janmashtami\games-website\server\index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// --- Import Routes ---
const playerRoutes = require('./routes/players');
const scoreRoutes = require('./routes/scores');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();

// --- Middleware ---
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000', 
      'http://localhost:5000',
      'https://kritikhel.vercel.app',
      'https://kritikhel-production.up.railway.app'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Test Route ---
app.get('/api', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// --- Use Routes ---
app.use('/api/players', playerRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});