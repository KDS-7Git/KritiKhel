import React, { useState } from 'react';
import './Games.css';

const choices = ['Rock', 'Paper', 'Scissors'];

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);

  const handlePlayerChoice = (choice) => {
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    setPlayerChoice(choice);
    setComputerChoice(computerChoice);
    setResult(determineWinner(choice, computerChoice));
  };

  const determineWinner = (player, computer) => {
    if (player === computer) return "It's a tie!";
    if (
      (player === 'Rock' && computer === 'Scissors') ||
      (player === 'Scissors' && computer === 'Paper') ||
      (player === 'Paper' && computer === 'Rock')
    ) {
      return 'You win!';
    }
    return 'You lose!';
  };

  return (
    <div className="rps-game">
      <h3>Choose your weapon:</h3>
      <div className="rps-choices">
        {choices.map((choice) => (
          <button key={choice} onClick={() => handlePlayerChoice(choice)}>
            {choice}
          </button>
        ))}
      </div>
      {playerChoice && (
        <div className="rps-results">
          <p>You chose: {playerChoice}</p>
          <p>Computer chose: {computerChoice}</p>
          <h4>{result}</h4>
        </div>
      )}
    </div>
  );
}