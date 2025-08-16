import React, { useState, useEffect } from 'react';
import GameList from './components/GameList';
import GameWindow from './components/GameWindow';
import LoginPage from './components/LoginPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './main.css';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [rollNumber, setRollNumber] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check localStorage on initial load
  useEffect(() => {
    const storedRollNumber = localStorage.getItem('rollNumber');
    const adminToken = localStorage.getItem('adminToken');
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');

    if (adminParam === 'true') {
      setIsAdminMode(true);
      if (adminToken) {
        setIsAdminLoggedIn(true);
      }
    } else if (storedRollNumber) {
      setRollNumber(storedRollNumber);
    }
  }, []);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  const handleLoginSuccess = (userRollNumber) => {
    localStorage.setItem('rollNumber', userRollNumber);
    setRollNumber(userRollNumber);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    setIsAdminMode(false);
    window.location.href = '/'; // Redirect to main page
  };

  // Admin mode rendering
  if (isAdminMode) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Regular user rendering
  if (!rollNumber) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      {selectedGame ? (
        <GameWindow game={selectedGame} onClose={handleCloseGame} rollNumber={rollNumber} />
      ) : (
        <GameList onGameSelect={handleGameSelect} />
      )}
    </div>
  );
}

export default App;