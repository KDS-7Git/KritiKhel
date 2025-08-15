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
    // Name validation: must be a non-empty string
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      setError('Name is required and must be a valid string.');
      return;
    }
    // Phone validation: must be a string of 10 digits
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    // Roll number validation
    if (!rollNumber || (rollNumber.length !== 6 && rollNumber.length !== 7)) {
      setError('Roll number must be 6 or 7 characters.');
      return;
    }
    if (rollNumber.length === 6) {
      if (!/^[A-Za-z][0-9]{5}$/.test(rollNumber)) {
        setError('6-character roll number: first must be a letter, next 5 digits.');
        return;
      }
    } else if (rollNumber.length === 7) {
      if (!/^[A-Za-z]{2}[0-9]{5}$/.test(rollNumber)) {
        setError('7-character roll number: first two must be letters, next 5 digits.');
        return;
      }
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
      <h1 className="main-title" >Kriti Khel @ IIT Mandi</h1>
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" disabled={isLoading} >
            {isLoading ? 'Registering...' : 'Enter Games'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;