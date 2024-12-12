const gameContainer = document.getElementById('game-container');
const mainMenu = document.getElementById('main-menu');
const gameArea = document.getElementById('game-area');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const scoreElement = document.getElementById('score-value');
const coinsElement = document.getElementById('coins-value');
const gambleButton = document.getElementById('gamble-button');
const gambleMenu = document.getElementById('gamble-menu');
const gambleActionButton = document.getElementById('gamble-action');
const closeGambleButton = document.getElementById('close-gamble');
const gambleResult = document.getElementById('gamble-result');
const instructionsButton = document.getElementById('instructions-button');
const instructionsMenu = document.getElementById('instructions-menu');
const closeInstructionsButton = document.getElementById('close-instructions');
const controlsButton = document.getElementById('controls-button');
const controlsMenu = document.getElementById('controls-menu');
const closeControlsButton = document.getElementById('close-controls');
const pauseButton = document.getElementById('pause-button');
const mainMenuButton = document.getElementById('main-menu-button');

let gameActive = false;
let gamePaused = false;
let player1X = gameContainer.clientWidth * 0.25;
let player2X = gameContainer.clientWidth * 0.75;
let score = 0;
let coins = parseInt(localStorage.getItem('coins')) || 0;
let enemies = [];
let powerups = [];
let enemySpawnInterval;

// Sound effects
const sounds = {
    coinCollect: new Audio('/sounds/coin-collect.mp3'),
    enemyHit: new Audio('/sounds/enemy-hit.mp3'),
    powerSurge: new Audio('/sounds/power-surge.mp3')
};

function startGame() {
    mainMenu.style.display = 'none';
    gameArea.style.display = 'block';
    restartButton.style.display = 'none';
    gambleButton.style.display = 'block';
    pauseButton.style.display = 'block';
    mainMenuButton.style.display = 'block';
    gameActive = true;
    gamePaused = false;
    score = 0;
    updateScore();
    updateCoins();
    gameLoop();
    startEnemySpawning();
    spawnPowerups();
}

function restartGame() {
    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    enemies = [];
    powerups = [];
    score = 0;
    updateScore();
    updateCoins();
    player1X = gameContainer.clientWidth * 0.25;
    player2X = gameContainer.clientWidth * 0.75;
    updatePlayerPositions();
    gameActive = true;
    gamePaused = false;
    restartButton.style.display = 'none';
    gambleButton.style.display = 'block';
    pauseButton.style.display = 'block';
    mainMenuButton.style.display = 'block';
    gameLoop();
    startEnemySpawning();
    spawnPowerups();
    
    // Remove game over message if it exists
    const gameOverMessage = document.getElementById('game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
}

function updatePlayerPositions(x) {
    const halfWidth = gameContainer.clientWidth / 2;

    if (x < halfWidth) {
        player1X = Math.max(25, Math.min(halfWidth - 25, x));
    } else {
        player2X = Math.max(halfWidth + 25, Math.min(gameContainer.clientWidth - 25, x));
    }

    player1.style.left = `${player1X}px`;
    player2.style.left = `${player2X}px`;
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateCoins() {
    coinsElement.textContent = coins;
    localStorage.setItem('coins', coins.toString());
}

function gameLoop() {
    if (!gameActive) return;
    if (!gamePaused) {
        moveEnemies();
        movePowerups();
        checkCollisions();
        updateScore();
        updateCoins();
    }
    requestAnimationFrame(gameLoop);
}

function startEnemySpawning() {
    if (enemySpawnInterval) {
        clearInterval(enemySpawnInterval);
    }
    
    enemySpawnInterval = setInterval(() => {
        if (!gamePaused && gameActive) {
            spawnEnemy();
        }
    }, 1000);
}

function spawnEnemy() {
    if (!gameActive) return;

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${Math.random() * (gameContainer.clientWidth - 30)}px`;
    enemy.style.top = '0px';
    gameArea.appendChild(enemy);
    enemies.push(enemy);
}

function spawnPowerups() {
    if (!gameActive) return;

    const powerup = document.createElement('div');
    powerup.classList.add('powerup');
    powerup.style.left = `${Math.random() * (gameContainer.clientWidth - 20)}px`;
    powerup.style.top = '0px';
    gameArea.appendChild(powerup);
    powerups.push(powerup);

    setTimeout(() => {
        if (!gamePaused && gameActive) {
            spawnPowerups();
        }
    }, 5000);
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        const top = parseFloat(enemy.style.top) || 0;
        enemy.style.top = `${top + 2}px`;
        enemy.style.transform = `translateY(${top}px)`;

        if (top > gameContainer.clientHeight) {
            enemy.remove();
            enemies.splice(index, 1);
            score++;
            updateScore();
        }
    });
}function updatePlayerPositions(x) {
    const halfWidth = gameContainer.clientWidth / 2;

    if (x < halfWidth) {
        player1X = Math.max(25, Math.min(halfWidth - 25, x));
    } else {
        player2X = Math.max(halfWidth + 25, Math.min(gameContainer.clientWidth - 25, x));
    }

    player1.style.left = `${player1X}px`;
    player2.style.left = `${player2X}px`;
}function updatePlayerPositions(x) {
    const halfWidth = gameContainer.clientWidth / 2;

    if (x < halfWidth) {
        player1X = Math.max(25, Math.min(halfWidth - 25, x));
    } else {
        player2X = Math.max(halfWidth + 25, Math.min(gameContainer.clientWidth - 25, x));
    }

    player1.style.left = `${player1X}px`;
    player2.style.left = `${player2X}px`;
}

function movePowerups() {
    powerups.forEach((powerup, index) => {
        const top = parseFloat(powerup.style.top) || 0;
        powerup.style.top = `${top + 1}px`;

        if (top > gameContainer.clientHeight) {
            powerup.remove();
            powerups.splice(index, 1);
        }
    });
}

function checkCollisions() {
    if (!gameActive) return;

    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyRect = enemy.getBoundingClientRect();

        if (isCollision(enemyRect, player1Rect) || isCollision(enemyRect, player2Rect)) {
            sounds.enemyHit.play();
            gameOver();
            return;
        }
    }

    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        const powerupRect = powerup.getBoundingClientRect();

        if (isCollision(powerupRect, player1Rect) || isCollision(powerupRect, player2Rect)) {
            powerup.remove();
            powerups.splice(i, 1);
            coins += 5;
            updateCoins();
            createCoinParticles(powerupRect.left, powerupRect.top);
            sounds.coinCollect.play();
        }
    }
}

function isCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

function createCoinParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.backgroundColor = '#ffd54f';
        particle.style.borderRadius = '50%';
        gameArea.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const lifetime = Math.random() * 500 + 500;

        setTimeout(() => {
            particle.remove();
        }, lifetime);

        animateParticle(particle, angle, speed);
    }
}

function animateParticle(particle, angle, speed) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);

    function update() {
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        if (particle.parentNode) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function gameOver() {
    gameActive = false;
    gamePaused = true;
    clearInterval(enemySpawnInterval);
    restartButton.style.display = 'block';
    gambleButton.style.display = 'none';
    pauseButton.style.display = 'none';
    mainMenuButton.style.display = 'block';
    gambleMenu.style.display = 'none';

    // Clear all existing enemies and powerups
    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    enemies = [];
    powerups = [];

    // Display game over message
    const gameOverMessage = document.createElement('div');
    gameOverMessage.id = 'game-over-message';
    gameOverMessage.textContent = 'Game Over! Earth has fallen.';
    gameOverMessage.style.position = 'absolute';
    gameOverMessage.style.top = '50%';
    gameOverMessage.style.left = '50%';
    gameOverMessage.style.transform = 'translate(-50%, -50%)';
    gameOverMessage.style.fontSize = '24px';
    gameOverMessage.style.color = '#ff5252';
    gameOverMessage.style.textAlign = 'center';
    gameArea.appendChild(gameOverMessage);
}

function handleMouseMove(event) {
    if (!gameActive || gamePaused) return;

    const rect = gameContainer.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    updatePlayerPositions(mouseX);
}

function handleTouchMove(event) {
    if (!gameActive || gamePaused) return;
    event.preventDefault();

    const rect = gameContainer.getBoundingClientRect();
    const touch = event.touches[0];
    const touchX = touch.clientX - rect.left;
    updatePlayerPositions(touchX);
}

function resizeGame() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    gameContainer.style.width = `${width}px`;
    gameContainer.style.height = `${height}px`;
    player1X = gameContainer.clientWidth * 0.25;
    player2X = gameContainer.clientWidth * 0.75;
    updatePlayerPositions();
}

window.addEventListener('resize', resizeGame);
resizeGame();

function toggleGamble() {
    if (gambleMenu.style.display === 'none') {
        gambleMenu.style.display = 'block';
        gamePaused = true;
    } else {
        gambleMenu.style.display = 'none';
        gamePaused = false;
        gameLoop();
    }
}

function gamble() {
    if (coins >= 5) {
        coins -= 5;
        const chance = Math.random();
        sounds.powerSurge.play();
        
        let winAmount = 0;
        if (chance < 0.1) { // 20% chance of winning 20 coins
            winAmount = 20;
        } else if (chance < 0.3) { // 20% chance of winning 10 coins
            winAmount = 10;
        } else if (chance < 0.5) { // 20% chance of winning 5 coins
            winAmount = 5;
        } else if (chance < 0.7) { // 20% chance of winning 2 coins
            winAmount = 2;
        } else if (chance <0.5){ // 70% chance of losing
            winAmount = -30;
        }
    
        
        coins += winAmount;
        
        const resultMessage = winAmount > 0 ? `Power surge successful! Gained ${winAmount} cosmic coins!` : "Power surge failed. No boost received.";
        gambleResult.textContent = resultMessage;
        
        updateCoins();
    }
}

function showInstructions() {
    instructionsMenu.style.display = 'block';
    gamePaused = true;
}

function showControls() {
    controlsMenu.style.display = 'block';
    gamePaused = true;
}

function togglePause() {
    gamePaused = !gamePaused;
    if (!gamePaused) {
        gameLoop();
    }
    pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
}

function backToMainMenu() {
    gameActive = false;
    gamePaused = false;
    clearInterval(enemySpawnInterval);
    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    enemies = [];
    powerups = [];
    mainMenu.style.display = 'flex';
    gameArea.style.display = 'none';
    gambleMenu.style.display = 'none';
    instructionsMenu.style.display = 'none';
    controlsMenu.style.display = 'none';
    restartButton.style.display = 'none';
    pauseButton.textContent = 'Pause';
    score = 0;
    updateScore();
    player1X = gameContainer.clientWidth * 0.25;
    player2X = gameContainer.clientWidth * 0.75;
    updatePlayerPositions();
    
    // Remove game over message if it exists
    const gameOverMessage = document.getElementById('game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
gameContainer.addEventListener('mousemove', handleMouseMove);
gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
gameContainer.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
gambleButton.addEventListener('click', toggleGamble);
gambleActionButton.addEventListener('click', gamble);
closeGambleButton.addEventListener('click', toggleGamble);
instructionsButton.addEventListener('click', showInstructions);
closeInstructionsButton.addEventListener('click', () => {
    instructionsMenu.style.display = 'none';
    gamePaused = false;
    gameLoop();
});
controlsButton.addEventListener('click', showControls);
closeControlsButton.addEventListener('click', () => {
    controlsMenu.style.display = 'none';
    gamePaused = false;
    gameLoop();
});
pauseButton.addEventListener('click', togglePause);
mainMenuButton.addEventListener('click', backToMainMenu);

// Initialize game state
gambleMenu.style.display = 'none';
updateCoins();
