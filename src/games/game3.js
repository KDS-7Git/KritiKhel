export function startGame3() {
    // Game 3 logic goes here
    console.log("Game 3 has started!");
    
    // Example game setup
    const gameContainer = document.createElement('div');
    gameContainer.innerHTML = `
        <h1>Welcome to Game 3</h1>
        <p>This is where the game will be played.</p>
        <button id="playButton">Play Game 3</button>
    `;
    
    document.body.appendChild(gameContainer);
    
    document.getElementById('playButton').addEventListener('click', () => {
        alert("Game 3 is now playing!");
        // Add game logic here
    });
}