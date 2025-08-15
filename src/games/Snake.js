import React, { useState, useEffect, useCallback } from 'react';
import './Games.css';

const GRID_SIZE = 20;
const TILE_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };

const Snake = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState({ x: 0, y: -1 }); // Start moving up
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    let newFoodPosition;
    do {
      newFoodPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y));
    setFood(newFoodPosition);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    generateFood();
    setDirection({ x: 0, y: -1 });
    setIsGameOver(false);
    setScore(0);
  };

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
      case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
      case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
      case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      default: break;
    }
  }, [direction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isGameOver) return;

    const gameInterval = setInterval(() => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setIsGameOver(true);
        return;
      }

      // Self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setIsGameOver(true);
          return;
        }
      }

      newSnake.unshift(head);

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, 200);

    return () => clearInterval(gameInterval);
  }, [snake, direction, food, isGameOver, generateFood]);

  return (
    <div className="snake-container">
      <div className="snake-score">Score: {score}</div>
      <div className="snake-grid" style={{ width: GRID_SIZE * TILE_SIZE, height: GRID_SIZE * TILE_SIZE }}>
        {isGameOver && (
          <div className="snake-game-over">
            <div>Game Over</div>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
        {snake.map((segment, index) => (
          <div key={index} className="snake-segment" style={{ left: segment.x * TILE_SIZE, top: segment.y * TILE_SIZE }} />
        ))}
        <div className="snake-food" style={{ left: food.x * TILE_SIZE, top: food.y * TILE_SIZE }} />
      </div>
    </div>
  );
};

export default Snake;