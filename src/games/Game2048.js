import React, { useState, useEffect } from 'react';
import './Games.css';

// Helper functions
const createInitialBoard = () => {
  let board = Array(4).fill(null).map(() => Array(4).fill(0));
  addRandomTile(board);
  addRandomTile(board);
  return board;
};

const addRandomTile = (board) => {
  let emptyTiles = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyTiles.push({ r, c });
      }
    }
  }
  if (emptyTiles.length > 0) {
    let { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board[r][c] = Math.random() > 0.9 ? 4 : 2;
  }
};

const slide = (row) => {
  let arr = row.filter(val => val);
  let missing = 4 - arr.length;
  let zeros = Array(missing).fill(0);
  return arr.concat(zeros);
};

const combine = (row) => {
  for (let i = 0; i < 3; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
    }
  }
  return row;
};

const operate = (row) => {
  row = slide(row);
  row = combine(row);
  row = slide(row);
  return row;
};

const rotateLeft = (board) => {
  let newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[r][c] = board[c][3 - r];
    }
  }
  return newBoard;
};

const rotateRight = (board) => {
  let newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[r][c] = board[3 - c][r];
    }
  }
  return newBoard;
};

const Game2048 = () => {
  const [board, setBoard] = useState(createInitialBoard());

  const move = (direction) => {
    let newBoard = JSON.parse(JSON.stringify(board));
    let moved = false;

    if (direction === 'left') {
      newBoard = newBoard.map(row => operate(row));
    } else if (direction === 'right') {
      newBoard = newBoard.map(row => operate(row.reverse()).reverse());
    } else if (direction === 'up') {
      newBoard = rotateRight(newBoard);
      newBoard = newBoard.map(row => operate(row));
      newBoard = rotateLeft(newBoard);
    } else if (direction === 'down') {
      newBoard = rotateRight(newBoard);
      newBoard = newBoard.map(row => operate(row.reverse()).reverse());
      newBoard = rotateLeft(newBoard);
    }
    
    moved = JSON.stringify(board) !== JSON.stringify(newBoard);

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp': move('up'); break;
      case 'ArrowDown': move('down'); break;
      case 'ArrowLeft': move('left'); break;
      case 'ArrowRight': move('right'); break;
      default: break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="game2048-container">
      <div className="game2048-board">
        {board.map((row, rIndex) => (
          <div key={rIndex} className="game2048-row">
            {row.map((val, cIndex) => (
              <div key={cIndex} className={`game2048-tile tile-${val}`}>
                {val > 0 ? val : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game2048;