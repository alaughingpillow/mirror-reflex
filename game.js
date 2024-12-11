const gameContainer = document.getElementById('game-container');
const mainMenu = document.getElementById('main-menu');
const gameArea = document.getElementById('game-area');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const scoreElement = document.getElementById('score-value');
const coinsElement = document.getElementById('coins-value');
const shopButton = document.getElementById('shop-button');
const shopMenu = document.getElementById('shop-menu');
const closeShopButton = document.getElementById('close-shop');
const buySpeedButton = document.getElementById('buy-speed');
const buySizeButton = document.getElementById('buy-size');
const buyMagnetButton = document.getElementById('buy-magnet');
const gambleButton = document.getElementById('gamble-button');

let gameActive = false;
let player1X = gameContainer.clientWidth * 0.25;
let player2X = gameContainer.clientWidth * 0.75;
let score = 0;
let coins = 0;
let enemies = [];
let powerups = [];

// Player upgrades
let playerSpeed = 1;
let playerSize = 50;
let hasCoinMagnet = false;

// Sound effects
const sounds = {
    coinCollect: new Audio('/sounds/coin-collect.mp3'),
    enemyHit: new Audio('/sounds/enemy-hit.mp3'),
    upgrade: new Audio('/sounds/upgrade.mp3'),
    gamble: new Audio('/sounds/gamble.mp3')
};

function startGame() {
    mainMenu.style.display = 'none';
    gameArea.style.display = 'block';
    restartButton.style.display = 'none';
    shopButton.style.display = 'block';
    gameActive = true;
    score = 0;
    coins = 0;
    updateScore();
    updateCoins();
    gameLoop();
    spawnEnemies();
    spawnPowerups();
}

function restartGame() {
    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    enemies = [];
    powerups = [];
    score = 0;
    coins = 0;
    playerSpeed = 1;
    playerSize = 50;
    hasCoinMagnet = false;
    updateScore();
    updateCoins();
    player1X = gameContainer.clientWidth * 0.25;
    player2X = gameContainer.clientWidth * 0.75;
    updatePlayerPositions();
    gameActive = true;
    restartButton.style.display = 'none';
    shopButton.style.display = 'block';
    gameLoop();
    spawnEnemies();
    spawnPowerups();
}

function updatePlayerPositions() {
    const halfWidth = gameContainer.clientWidth / 2;
    player1.style.left = `${Math.max(playerSize / 2, Math.min(halfWidth - playerSize / 2, player1X))}px`;
    player2.style.left = `${Math.max(halfWidth + playerSize / 2, Math.min(gameContainer.clientWidth - playerSize / 2, player2X))}px`;
    player1.style.width = `${playerSize}px`;
    player1.style.height = `${playerSize}px`;
    player2.style.width = `${playerSize}px`;
    player2.style.height = `${playerSize}px`;
}

function updateScore() {
    scoreElement.textContent = score;
}

function updateCoins() {
    coinsElement.textContent = coins;
    updateShopButtons(); // Update buttons when coins change
}

function gameLoop() {
    if (!gameActive) return;

    moveEnemies();
    movePowerups();
    checkCollisions();
    updatePlayerPositions();

    requestAnimationFrame(gameLoop);
}

function spawnEnemies() {
    if (!gameActive) return;

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${Math.random() * (gameContainer.clientWidth - 30)}px`;
    enemy.style.top = '0px';
    gameArea.appendChild(enemy);
    enemies.push(enemy);

    const difficulty = Math.min(1 + score / 100, 2);
    setTimeout(spawnEnemies, 1000 / difficulty);
}

function spawnPowerups() {
    if (!gameActive) return;

    const powerup = document.createElement('div');
    powerup.classList.add('powerup');
    powerup.style.left = `${Math.random() * (gameContainer.clientWidth - 20)}px`;
    powerup.style.top = '0px';
    powerup.style.width = '20px';
    powerup.style.height = '20px';
    powerup.style.borderRadius = '50%';
    powerup.style.backgroundColor = '#f1c40f';
    powerup.style.position = 'absolute';
    gameArea.appendChild(powerup);
    powerups.push(powerup);

    setTimeout(spawnPowerups, 5000);
}

function moveEnemies() {
    const difficulty = Math.min(1 + score / 100, 2);
    enemies.forEach((enemy, index) => {
        const top = parseFloat(enemy.style.top) || 0;
        enemy.style.top = `${top + 2 * difficulty}px`;

        if (top > gameContainer.clientHeight) {
            enemy.remove();
            enemies.splice(index, 1);
            score++;
            updateScore();
        }
    });
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
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();

    enemies.forEach((enemy, index) => {
        const enemyRect = enemy.getBoundingClientRect();

        if (
            (enemyRect.left < player1Rect.right &&
            enemyRect.right > player1Rect.left &&
            enemyRect.bottom > player1Rect.top &&
            enemyRect.top < player1Rect.bottom) ||
            (enemyRect.left < player2Rect.right &&
            enemyRect.right > player2Rect.left &&
            enemyRect.bottom > player2Rect.top &&
            enemyRect.top < player2Rect.bottom)
        ) {
            sounds.enemyHit.play();
            gameOver();
        }
    });

    powerups.forEach((powerup, index) => {
        const powerupRect = powerup.getBoundingClientRect();

        if (
            (powerupRect.left < player1Rect.right &&
            powerupRect.right > player1Rect.left &&
            powerupRect.bottom > player1Rect.top &&
            powerupRect.top < player1Rect.bottom) ||
            (powerupRect.left < player2Rect.right &&
            powerupRect.right > player2Rect.left &&
            powerupRect.bottom > player2Rect.top &&
            powerupRect.top < player2Rect.bottom) ||
            (hasCoinMagnet && powerupRect.bottom > gameContainer.clientHeight - 100)
        ) {
            powerup.remove();
            powerups.splice(index, 1);
            coins += 5;
            updateCoins();
            createCoinParticles(powerupRect.left, powerupRect.top);
            sounds.coinCollect.play();
        }
    });
}

function createCoinParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.backgroundColor = '#f1c40f';
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
    restartButton.style.display = 'block';
    shopButton.style.display = 'none';
}

function handleMouseMove(event) {
    if (!gameActive) return;

    const rect = gameContainer.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (mouseX < halfWidth) {
        player1X = Math.max(playerSize / 2, Math.min(halfWidth - playerSize / 2, mouseX));
    } else {
        player2X = Math.max(halfWidth + playerSize / 2, Math.min(rect.width - playerSize / 2, mouseX));
    }
}

function handleTouchMove(event) {
    if (!gameActive) return;
    event.preventDefault();

    const rect = gameContainer.getBoundingClientRect();
    const halfWidth = rect.width / 2;

    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        const touchX = touch.clientX - rect.left;

        if (touchX < halfWidth) {
            player1X = Math.max(playerSize / 2, Math.min(halfWidth - playerSize / 2, touchX));
        } else {
            player2X = Math.max(halfWidth + playerSize / 2, Math.min(rect.width - playerSize / 2, touchX));
        }
    }
}

function toggleShop() {
    if (shopMenu.style.display === 'none') {
        shopMenu.style.display = 'block';
        gameActive = false;
    } else {
        shopMenu.style.display = 'none';
        gameActive = true;
        gameLoop();
    }
}

function buySpeedBoost() {
    if (coins >= 10) {
        coins -= 10;
        playerSpeed += 0.2;
        updateCoins();
        updateShopButtons();
        sounds.upgrade.play();
    }
}

function buySizeReduction() {
    if (coins >= 15 && playerSize > 30) {
        coins -= 15;
        playerSize -= 5;
        updateCoins();
        updateShopButtons();
        sounds.upgrade.play();
    }
}

function buyCoinMagnet() {
    if (coins >= 20 && !hasCoinMagnet) {
        coins -= 20;
        hasCoinMagnet = true;
        updateCoins();
        updateShopButtons();
        sounds.upgrade.play();
    }
}

function gamble() {
    if (coins >= 5) {
        coins -= 5;
        const chance = Math.random();
        sounds.gamble.play();
        
        let winAmount = 0;
        if (chance < 0.4) {
            winAmount = 10;
        } else if (chance < 0.6) {
            winAmount = 15;
        } else if (chance < 0.8) {
            winAmount = 5;
        }
        
        coins += winAmount;
        
        const resultMessage = winAmount > 0 ? `You won ${winAmount} coins!` : "Sorry, you lost this time.";
        alert(resultMessage);
        
        updateCoins();
        updateShopButtons();
    }
}

function updateShopButtons() {
    buySpeedButton.disabled = coins < 10;
    buySizeButton.disabled = coins < 15 || playerSize <= 30;
    buyMagnetButton.disabled = coins < 20 || hasCoinMagnet;
    gambleButton.disabled = coins < 5 || !gameActive; // Disable gamble button if not enough coins or game is inactive
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
shopButton.addEventListener('click', toggleShop);
closeShopButton.addEventListener('click', toggleShop);

buySpeedButton.addEventListener('click', buySpeedBoost);
buySizeButton.addEventListener('click', buySizeReduction);
buyMagnetButton.addEventListener('click', buyCoinMagnet);
gambleButton.addEventListener('click', gamble);

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove);
