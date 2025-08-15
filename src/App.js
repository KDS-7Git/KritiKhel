import React, { useState, useEffect } from 'react';
import GameList from './components/GameList';
import GameWindow from './components/GameWindow';
import LoginPage from './components/LoginPage'; // Import LoginPage
import './main.css';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  // --- State to manage user login ---
  const [rollNumber, setRollNumber] = useState(null);

  // --- Check localStorage on initial load ---
  useEffect(() => {
    const storedRollNumber = localStorage.getItem('rollNumber');
    if (storedRollNumber) {
      setRollNumber(storedRollNumber);
    }
  }, []);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  // --- Function to handle successful login ---
  const handleLoginSuccess = (userRollNumber) => {
    localStorage.setItem('rollNumber', userRollNumber);
    setRollNumber(userRollNumber);
  };

  // --- Conditional Rendering ---
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