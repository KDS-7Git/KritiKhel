import React from 'react';

const games = [
  { id: 6, name: 'Jumbled Words Challenge' },
  { id: 5, name: 'Mahabharata Bubble Challenge' },
  // { id: 1, name: 'Tic Tac Toe' },
  // { id: 2, name: 'Rock Paper Scissors' },
  // { id: 3, name: 'Snake' },
  // { id: 4, name: '2048' },
];

function GameList({ onGameSelect }) {
  return (
    <div className="game-list">
      <h1 className="main-title">KritiKhel</h1>
      <h2 className="sub-title">Janmashtami IIT Mandi</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <button onClick={() => onGameSelect(game)}>{game.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GameList;