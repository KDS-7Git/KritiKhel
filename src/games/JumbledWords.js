import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Games.css';
import { submitScore, startGameSession } from '../services/api';

const mahabharata_characters = [
"Rāma", "Sītā", "Lava", "Kuśa", "Hanumān", "Jatāyu", "Bharata", "Sugrīva", "Vibhīṣaṇa", "Mārīca", "Aṅgada", "Tārā", "Indrajit", "Arjuna", "Bhīma", "Nakula", "Kṛṣṇa", "Karṇa", "Vidura", "Śakuni", "Ghaṭa", "Śānti", "Satyā", "Draupadī", "Ulūka", "Abhīra"
];

// Fisher-Yates Shuffle algorithm
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const JumbledWords = ({ rollNumber }) => {
  const [correctWord, setCorrectWord] = useState('');
  const [letters, setLetters] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [score, setScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameActive, setGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameToken, setGameToken] = useState(null);

  const shuffledWordsRef = useRef([]);
  const wordIndexRef = useRef(0);

  useEffect(() => {
    if (shuffledWordsRef.current.length === 0) {
      shuffledWordsRef.current = shuffleArray([...mahabharata_characters]);
      wordIndexRef.current = 0;
    }
  }, []);

  const setupNewRound = () => {
    if (wordIndexRef.current >= shuffledWordsRef.current.length) {
      shuffledWordsRef.current = shuffleArray([...mahabharata_characters]);
      wordIndexRef.current = 0;
    }
    const word = shuffledWordsRef.current[wordIndexRef.current++];
    setCorrectWord(word);

    const shuffled = shuffleArray([...word]);
    setLetters(shuffled.map((char, index) => ({
      id: index,
      char: char,
      isPlaced: false,
      placedTimestamp: null,
    })));

    setIsCorrect(false);
    setIsIncorrect(false);
  };

  useEffect(() => {
    if (!gameActive) return;

    if (timeLeft <= 0) {
      setGameActive(false);
      setIsGameOver(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameActive, timeLeft]);

  // Submit score only when game is completely over
  useEffect(() => {
    if (isGameOver && !gameActive && gameToken) {
      submitScore({ 
        rollNumber, 
        gameId: 'jumbledWords', 
        score,
        gameToken 
      });
    }
  }, [isGameOver, gameActive, score, rollNumber, gameToken]);

  const startGame = async () => {
    try {
      // Get game session token first
      const session = await startGameSession(rollNumber, 'jumbledWords');
      setGameToken(session.gameToken);
      
      // Start the game
      setScore(0);
      setTimeLeft(300);
      setIsGameOver(false);
      setGameActive(true);
      setupNewRound();
    } catch (error) {
      console.error('Failed to start game session:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const placedLetters = useMemo(() =>
    letters
      .filter(l => l.isPlaced)
      .sort((a, b) => a.placedTimestamp - b.placedTimestamp),
    [letters]
  );

  const availableLetters = useMemo(() => letters.filter(l => !l.isPlaced), [letters]);

  // --- Updated answer checking logic ---
  useEffect(() => {
    if (!gameActive || placedLetters.length === 0 || placedLetters.length < correctWord.length) {
      return;
    }

    const currentGuess = placedLetters.map(l => l.char).join('');
    if (currentGuess === correctWord) {
      setIsCorrect(true);
      setScore(s => s + 10);
    } else {
      // --- Set incorrect state permanently until user proceeds ---
      setIsIncorrect(true);
      setScore(s => s - 5);
    }
  }, [placedLetters, correctWord, gameActive]);

  const handleLetterClick = (clickedLetter) => {
    // --- Prevent interaction if word is already marked correct OR incorrect ---
    if (isCorrect || isIncorrect || !gameActive) return;
    setLetters(prevLetters =>
      prevLetters.map(letter => {
        if (letter.id === clickedLetter.id) {
          const isBeingPlaced = !letter.isPlaced;
          return {
            ...letter,
            isPlaced: isBeingPlaced,
            placedTimestamp: isBeingPlaced ? Date.now() : null,
          };
        }
        return letter;
      })
    );
  };

  // --- UI Rendering for different game states ---
  if (isGameOver) {
    return (
      <div className="jumbled-words-container">
        <div className="jumbled-feedback">
          <h2>Time's Up!</h2>
          <p>Your final score is: {score}</p>
          <button className="next-word-btn" onClick={startGame}>Play Again</button>
        </div>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="jumbled-words-container">
        <div className="jumbled-feedback">
          <h2>Names from Our Scriptures</h2>
          <p>Unscramble as many names as you can in 5 minutes!</p>
          <button className="next-word-btn" onClick={startGame}>Start Game</button>
        </div>
      </div>
    );
  }

  return (
    <div className="jumbled-words-container">
      <div className="jumbled-stats">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>

      <div className={`answer-box ${isIncorrect ? 'incorrect' : ''}`}>
        {placedLetters.map(letter => (
          <button key={letter.id} className="letter-tile placed" onClick={() => handleLetterClick(letter)}>
            {letter.char}
          </button>
        ))}
        {[...Array(correctWord.length - placedLetters.length)].map((_, i) => (
          <div key={i} className="letter-tile blank"></div>
        ))}
      </div>

      <div className="shuffled-letters-pool">
        {availableLetters.map(letter => (
          <button key={letter.id} className="letter-tile" onClick={() => handleLetterClick(letter)}>
            {letter.char}
          </button>
        ))}
      </div>

      {/* --- Render feedback for correct OR incorrect answers --- */}
      {isCorrect && (
        <div className="jumbled-feedback">
          <p>Correct! +10</p>
          <button className="next-word-btn" onClick={setupNewRound}>Next Word</button>
        </div>
      )}
      {isIncorrect && (
        <div className="jumbled-feedback">
          <p>Incorrect! -5</p>
          <button className="next-word-btn" onClick={setupNewRound}>Next Word</button>
        </div>
      )}
    </div>
  );
};

export default JumbledWords;