function Game5() {
    // Game initialization logic
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    document.body.appendChild(canvas);

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game variables
    let playerX = canvas.width / 2;
    let playerY = canvas.height / 2;
    const playerSize = 20;

    // Game loop
    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'blue';
        context.fillRect(playerX, playerY, playerSize, playerSize);
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    gameLoop();
}

export default Game5;