import React from 'react';
import TicTacToe from '../games/TicTacToe';
import RockPaperScissors from '../games/RockPaperScissors';
import Snake from '../games/Snake';
import Game2048 from '../games/Game2048';
import BubbleChallenge from '../games/BubbleChallenge';
import JumbledWords from '../games/JumbledWords';

// A simple mapping from game ID to the game component
const gameComponents = {
  // 1: TicTacToe,
  // 2: RockPaperScissors,
  // 3: Snake,
  // 4: Game2048,
  5: BubbleChallenge,
  6: JumbledWords,
};

function GameWindow({ game, onClose, rollNumber }) {
  // Look up the component based on the selected game's ID
  const GameComponent = gameComponents[game.id];

  return (
    <div className="game-window">
      <h2>{game.name}</h2>
      
      {/* Render the selected game component if it exists */}
      {GameComponent ? <GameComponent rollNumber={rollNumber} /> : <p>Game coming soon!</p>}
      
      <button onClick={onClose} style={{ marginTop: '20px' }}>
        Back to Games
      </button>
    </div>
  );
}

export default GameWindow;