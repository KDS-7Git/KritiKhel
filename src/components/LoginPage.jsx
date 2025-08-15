// filepath: d:\WebDev\Janmashtami\games-website\src\components\LoginPage.jsx
import React, { useState } from 'react';
import { registerPlayer } from '../services/api';

const LoginPage = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !rollNumber || !phone) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const playerData = { name, rollNumber, phone };
      const registeredPlayer = await registerPlayer(playerData);
      onLoginSuccess(registeredPlayer.rollNumber);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="main-title">Leela Games @ IIT Mandi</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Roll Number (e.g., B21001)"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Enter Games'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;