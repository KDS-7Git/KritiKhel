import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Games.css';
import { submitScore } from '../services/api';

// --- Game Data ---
const listA = ["kṛṣṇa", "govinda", "gopāla", "mādhava", "murlīdhara", "śyāmasundara",
    "vāsudeva", "devakīnandana", "yaśodānandana", "gopīnātha", "rādhānātha",
    "murāri", "kesava", "viṣṇu", "dāmodara", "mādhusūdana", "janārdana",
    "padmanābha", "puruṣottama", "hr̥ṣīkeśa", "acyuta", "ananta", "govardhanadhārī",
    "gopavr̥ndapālaka", "nandanandana", "vṛndāvanacandra", "rasarāja", "gītagopāla",
    "manohara", "līlādhara", "murlīmanohara", "rādhāvallabha", "rādhākānta",
    "rādhāramana", "śrīpati", "śrīnatha", "śrīgovinda", "śrīkṛṣṇa", "śrīmādhava",
    "śrīmurāri", "śrīhari", "śrīmanohara", "śrīviṣṇu", "śrīdāmodara",
    "śrījanārdana", "śrīhr̥ṣīkeśa", "śrīacyuta", "śrīpuruṣottama", "śrīananta"
];
const listB = [ "arjuna", "bhīma", "yudhiṣṭhira", "nakula", "sahadeva", "draupadī",
    "abhimanyu", "uttarā", "śikhaṇḍin", "virāṭa", "dhṛtarāṣṭra", "gāndhārī",
    "karṇa", "śalya", "aśvatthāmā", "droṇa", "kṛpācārya", "vidura",
    "duryodhana", "duḥśāsana", "śakuni", "ulūka", "bhagadatta", "jayadratha",
    "ghaṭotkaca", "irāvān", "satyavān", "sāvitrī", "ambā", "ambikā",
    "ambālikā", "śantanu", "gaṅgā", "bhīṣma", "satyavatī", "parāśara",
    "vichitravīrya", "utanka", "pratīpa", "suśarmā", "somadatta",
    "bhūriśravā", "citrasena", "alambusha", "bāhlīka", "jarāsandha",
    "śiśupāla", "pāṇḍu", "mādrī", "kuntī",
    "sītā", "lakṣmaṇa", "bharata", "śatrughna", "hanūmān", "sugrīva",
    "vibhīṣaṇa", "rāvaṇa", "kumbhakarṇa", "indrajit", "tārā", "aṅgada",
    "jāmbavān", "mainda", "dvīvida", "trijaṭā", "śūrpaṇakhā", "mālyavān",
    "akampana", "pratapānka", "nikumbha", "prahasta", "vajradamṣṭra",
    "dūṣaṇa", "khara", "marīca", "subāhu", "kabandha", "jatāyus",
    "saṁpāti", "anila", "nal", "nīla", "sampāti", "śaradvan",
    "viśvāmitra", "janaka", "śatānanda", "gautama", "ahalyā",
    "agastya", "śuka", "sarama", "sumitrā", "kaikeyī", "kauśalyā",
    "lava", "kuśa", "sumantra", "ruma"
];

const BubbleChallenge = ({ rollNumber }) => {
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('bubbleHighScore') || '0'));
    const [bubbles, setBubbles] = useState([]);
    const [combo, setCombo] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [lives, setLives] = useState(3);
    const [isGameOver, setIsGameOver] = useState(false);
    const gameAreaRef = useRef(null);

    // Refs for shuffled lists and indices
    const shuffledARef = useRef([]);
    const shuffledBRef = useRef([]);
    const indexARef = useRef(0);
    const indexBRef = useRef(0);

    // Initialize or reset shuffled lists and indices when game starts
    useEffect(() => {
        if (gameStarted) {
            shuffledARef.current = [...listA].sort(() => Math.random() - 0.5);
            shuffledBRef.current = [...listB].sort(() => Math.random() - 0.5);
            indexARef.current = 0;
            indexBRef.current = 0;
        }
    }, [gameStarted]);

    function getNextName(type) {
        if (type === 'A') {
            if (indexARef.current >= shuffledARef.current.length) {
                shuffledARef.current = [...listA].sort(() => Math.random() - 0.5);
                indexARef.current = 0;
            }
            return shuffledARef.current[indexARef.current++];
        } else {
            if (indexBRef.current >= shuffledBRef.current.length) {
                shuffledBRef.current = [...listB].sort(() => Math.random() - 0.5);
                indexBRef.current = 0;
            }
            return shuffledBRef.current[indexBRef.current++];
        }
    }

    // --- Scoring and High Score Logic ---
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('bubbleHighScore', score.toString());
        }
    }, [score, highScore]);

    const resetHighScore = () => {
        localStorage.setItem('bubbleHighScore', '0');
        setHighScore(0);
    };

    // --- Game Loop ---
    useEffect(() => {
        if (!gameStarted || isGameOver) return;

        let animationFrameId;
        let lastBubbleTime = 0;

        const gameLoop = (timestamp) => {
            setBubbles(prevBubbles =>
                prevBubbles.map(b => ({ ...b, y: b.y - b.speed }))
                    .filter(b => {
                        if (b.y < -100) {
                            if (b.type === 'A') {
                                setScore(s => Math.max(0, s - 5));
                                setCombo(0);
                            }
                            return false;
                        }
                        return true;
                    })
            );

            if (timestamp - lastBubbleTime > 1500) {
                lastBubbleTime = timestamp;
                const type = Math.random() < 0.6 ? 'A' : 'B';
                const name = getNextName(type);
                const size = Math.random() * 40 + 60;
                setBubbles(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    name, type, size,
                    speed: Math.random() * 0.5 + 2.5,
                    x: Math.random() * (gameAreaRef.current.offsetWidth - size),
                    y: gameAreaRef.current.offsetHeight,
                }]);
            }

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameStarted, isGameOver]);

    // --- Bubble Click Handler ---
    const handleBubbleClick = (bubble) => {
        if (isGameOver) return; // Prevent clicks after game over

        if (bubble.type === 'A') {
            const points = combo >= 3 ? 15 : 10;
            setScore(s => s + points);
            setCombo(c => c + 1);
        } else { // Type 'B' - Wrong Click
            setCombo(0);
            setLives(prevLives => {
                const newLives = prevLives - 1;
                if (newLives <= 0) {
                    setIsGameOver(true);
                    setGameStarted(false);
                    submitScore({ rollNumber, gameId: 'bubbleChallenge', score });
                }
                return newLives;
            });
        }
        setBubbles(bs => bs.filter(b => b.id !== bubble.id));
    };

    const startGame = () => {
        setScore(0);
        setCombo(0);
        setBubbles([]);
        setLives(3);
        setIsGameOver(false);
        setGameStarted(true);
    };

    const Stars = ({ count }) => (
        <div className="stars-container">
            {[...Array(3)].map((_, i) => (
                <span key={i} className={`star ${i < count ? '' : 'empty'}`}>★</span>
            ))}
        </div>
    );

    return (
        <div className="bubble-challenge-container">
            <div className="bubble-stats">
                <div className="score-display">
                    {/* Each stat is now in its own div for proper layout */}
                    <div>Score: {score}</div>
                    <div>High Score: {highScore}</div>
                </div>
                {/* Show stars during the game, even on the last life */}
                {(gameStarted || isGameOver) && <Stars count={lives} />}
            </div>

            <div className="bubble-game-area" ref={gameAreaRef}>
                {isGameOver && (
                    <div className="bubble-overlay-screen">
                        <h3>Game Over!</h3>
                        <p>Your final score was: {score}</p>
                        <button onClick={startGame}>Play Again</button>
                    </div>
                )}

                {!gameStarted && !isGameOver && (
                    <div className="bubble-overlay-screen">
                        <h3>Mahabharata Bubble Challenge</h3>
                        <button onClick={startGame}>Start Game</button>
                        <button className="bubble-reset-btn" onClick={resetHighScore}>Reset High Score</button>
                    </div>
                )}

                {gameStarted &&
                    bubbles.map(bubble => (
                        <div
                            key={bubble.id}
                            className={`bubble ${bubble.type === 'A' ? 'bubble-good' : 'bubble-bad'}`}
                            style={{
                                left: `${bubble.x}px`,
                                top: `${bubble.y}px`,
                                width: `${bubble.size}px`,
                                height: `${bubble.size}px`,
                            }}
                            onClick={() => handleBubbleClick(bubble)}
                        >
                            {bubble.name}
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default BubbleChallenge;