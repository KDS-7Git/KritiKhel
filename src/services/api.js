// filepath: d:\WebDev\Janmashtami\games-website\src\services\api.js
import axios from 'axios';

// Use proxy in development, full URL in production
const API_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'https://kritikhel-production.up.railway.app/api')
  : '/api'; // Uses the proxy we set up in package.json for development

export const registerPlayer = async (playerData) => {
  try {
    const response = await axios.post(`${API_URL}/players/register`, playerData);
    return response.data;
  } catch (error) {
    console.error("Error registering player:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const startGameSession = async (rollNumber, gameId) => {
  try {
    const response = await axios.post(`${API_URL}/scores/start-game`, {
      rollNumber,
      gameId
    });
    return response.data;
  } catch (error) {
    console.error("Error starting game session:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const submitScore = async (scoreData) => {
  try {
    const response = await axios.post(`${API_URL}/scores/submit`, scoreData);
    return response.data;
  } catch (error) {
    console.error("Error submitting score:", error.response?.data?.message || error.message);
    throw error;
  }
};