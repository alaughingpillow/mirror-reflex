let gameLoopId;

const gameContainer = document.getElementById('game-container');
const mainMenu = document.getElementById('main-menu');
const gameArea = document.getElementById('game-area');
const startButton = document.getElementById('start-button');
const instructionsButton = document.getElementById('instructions-button');
const controlsButton = document.getElementById('controls-button');
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
const instructionsMenu = document.getElementById('instructions-menu');
const closeInstructionsButton = document.getElementById('close-instructions');
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
let projectiles = [];
let enemySpawnInterval;
let lastFrameTime = 0;

const ENEMY_SPAWN_RATE = 1000; // 1 second
const ENEMY_SPEED = 300; // pixels per second (increased from 200)
const POWERUP_SPAWN_RATE = 5000; // 5 seconds
const PROJECTILE_SPEED = 300; // pixels per second

// Sound effects and background music
const sounds = {
    coinCollect: new Audio('./assets/sounds/coin-collect.mp3'),
    enemyHit: new Audio('./assets/sounds/enemy-hit.mp3'),
    powerSurge: new Audio('./assets/sounds/power-surge.mp3'),
    backgroundMusic1: new Audio('./assets/sounds/background-music-1.mp3'),
    backgroundMusic2: new Audio('./assets/sounds/background-music-2.mp3'),
    backgroundMusic3: new Audio('./assets/sounds/background-music-3.mp3'),
    backgroundMusic4: new Audio('./assets/sounds/background-music-4.mp3')
};

let currentMusicTrack = 1;
let isMusicPlaying = false;

function initializeSounds() {
    Object.values(sounds).forEach(sound => {
        sound.load();
        sound.volume = 0.5; // Set volume to 50%
    });

    // Set all background music tracks to loop
    for (let i = 1; i <= 4; i++) {
        sounds[`backgroundMusic${i}`].loop = true;
    }

    // Try to enable audio on user interaction
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
}

function unlockAudio() {
    Object.values(sounds).forEach(sound => {
        sound.play().then(() => {
            if (!sound.src.includes('background-music')) {
                sound.pause();
                sound.currentTime = 0;
            }
        }).catch(error => {
            console.log('Audio play failed:', error);
        });
    });
    document.getElementById('sound-message').style.display = 'none';
    playBackgroundMusic();
}

function playBackgroundMusic() {
    if (!isMusicPlaying) {
        sounds[`backgroundMusic${currentMusicTrack}`].play().then(() => {
            isMusicPlaying = true;
            scheduleNextTrack();
        }).catch(error => {
            console.log('Background music play failed:', error);
        });
    }
}

function scheduleNextTrack() {
    const currentTrack = sounds[`backgroundMusic${currentMusicTrack}`];
    const trackDuration = 8000; // 8 seconds in milliseconds

    setTimeout(() => {
        fadeOutCurrentTrack(() => {
            currentMusicTrack = (currentMusicTrack % 4) + 1;
            playBackgroundMusic();
        });
    }, trackDuration - 1000); // Schedule 1 second before the end for smooth transition
}

function fadeOutCurrentTrack(callback) {
    const currentTrack = sounds[`backgroundMusic${currentMusicTrack}`];
    const fadeOutDuration = 1000; // 1 second fade out
    const fadeOutInterval = 50; // Update every 50ms
    const volumeStep = currentTrack.volume / (fadeOutDuration / fadeOutInterval);

    const fadeOutTimer = setInterval(() => {
        if (currentTrack.volume > volumeStep) {
            currentTrack.volume -= volumeStep;
        } else {
            clearInterval(fadeOutTimer);
            currentTrack.pause();
            currentTrack.currentTime = 0;
            currentTrack.volume = 0.5; // Reset volume for next play
            isMusicPlaying = false;
            if (callback) callback();
        }
    }, fadeOutInterval);
}

function pauseBackgroundMusic() {
    sounds[`backgroundMusic${currentMusicTrack}`].pause();
    isMusicPlaying = false;
}

function resumeBackgroundMusic() {
    if (!isMusicPlaying) {
        playBackgroundMusic();
    }
}

function toggleBackgroundMusic() {
    if (isMusicPlaying) {
        pauseBackgroundMusic();
    } else {
        resumeBackgroundMusic();
    }
    updateMusicToggleButton();
}

function updateMusicToggleButton() {
    const musicToggleButton = document.getElementById('music-toggle');
    if (musicToggleButton) {
        musicToggleButton.textContent = isMusicPlaying ? 'Mute Music' : 'Play Music';
    }
}

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
    lastFrameTime = performance.now();
    gameLoop();
    startEnemySpawning();
    spawnPowerups();
    playBackgroundMusic();
}

function restartGame() {
    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    projectiles.forEach(projectile => projectile.remove());
    enemies = [];
    powerups = [];
    projectiles = [];
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
    lastFrameTime = performance.now();
    gameLoop();
    startEnemySpawning();
    spawnPowerups();
    playBackgroundMusic();
    
    const gameOverMessage = document.getElementById('game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }
}

function pauseBackgroundMusic() {
    sounds[`backgroundMusic${currentMusicTrack}`].pause();
    isMusicPlaying = false;
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

function gameLoop(currentTime) {
    if (!gameActive) return;

    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    if (!gamePaused) {
        moveEnemies(deltaTime);
        movePowerups(deltaTime);
        moveProjectiles(deltaTime);
        checkCollisions();
    }

    gameLoopId = requestAnimationFrame(gameLoop);
}

function startEnemySpawning() {
    if (enemySpawnInterval) {
        clearInterval(enemySpawnInterval);
    }
    
    enemySpawnInterval = setInterval(() => {
        if (!gamePaused && gameActive) {
            spawnEnemy();
        }
    }, ENEMY_SPAWN_RATE);
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
        if (gameActive) {
            spawnPowerups();
        }
    }, POWERUP_SPAWN_RATE);
}

function moveEnemies(deltaTime) {
    enemies.forEach((enemy, index) => {
        const newTop = parseFloat(enemy.style.top) + ENEMY_SPEED * deltaTime;
        enemy.style.top = `${newTop}px`;

        // Check for collision immediately after moving
        if (checkEnemyCollision(enemy)) {
            gameOver();
            return;
        }

        if (newTop > gameContainer.clientHeight) {
            enemy.remove();
            enemies.splice(index, 1);
            score++;
            updateScore();
        }
    });
}

function checkEnemyCollision(enemy) {
    const enemyRect = enemy.getBoundingClientRect();
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();

    // Adjust collision box size (reduce by 25% on each side)
    const adjustCollisionBox = (rect) => {
        const widthReduction = rect.width * 0.25;
        const heightReduction = rect.height * 0.25;
        return {
            left: rect.left + widthReduction,
            right: rect.right - widthReduction,
            top: rect.top + heightReduction,
            bottom: rect.bottom - heightReduction
        };
    };

    const adjustedEnemyRect = adjustCollisionBox(enemyRect);
    const adjustedPlayer1Rect = adjustCollisionBox(player1Rect);
    const adjustedPlayer2Rect = adjustCollisionBox(player2Rect);

    // Check if the enemy intersects with either player
    if (
        (adjustedEnemyRect.left < adjustedPlayer1Rect.right &&
        adjustedEnemyRect.right > adjustedPlayer1Rect.left &&
        adjustedEnemyRect.top < adjustedPlayer1Rect.bottom &&
        adjustedEnemyRect.bottom > adjustedPlayer1Rect.top) ||
        (adjustedEnemyRect.left < adjustedPlayer2Rect.right &&
        adjustedEnemyRect.right > adjustedPlayer2Rect.left &&
        adjustedEnemyRect.top < adjustedPlayer2Rect.bottom &&
        adjustedEnemyRect.bottom > adjustedPlayer2Rect.top)
    ) {
        sounds.enemyHit.play().catch(e => console.log("Audio play failed:", e));
        return true;
    }

    return false;
}

function movePowerups(deltaTime) {
    powerups.forEach((powerup, index) => {
        const top = parseFloat(powerup.style.top) || 0;
        const newTop = top + 50 * deltaTime; // 50 pixels per second
        powerup.style.top = `${newTop}px`;

        if (newTop > gameContainer.clientHeight) {
            powerup.remove();
            powerups.splice(index, 1);
        }
    });
}

function moveProjectiles(deltaTime) {
    projectiles.forEach((projectile, index) => {
        const top = parseFloat(projectile.style.top) || 0;
        const newTop = top - PROJECTILE_SPEED * deltaTime;
        projectile.style.top = `${newTop}px`;

        if (newTop < 0) {
            projectile.remove();
            projectiles.splice(index, 1);
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

        for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j];
            const projectileRect = projectile.getBoundingClientRect();

            if (isCollision(enemyRect, projectileRect)) {
                enemy.remove();
                enemies.splice(i, 1);
                projectile.remove();
                projectiles.splice(j, 1);
                score += 10;
                updateScore();
                break;
            }
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
            sounds.coinCollect.play().catch(e => console.log("Audio play failed:", e));
        }
    }
}

function isCollision(rect1, rect2) {
    const adjustCollisionBox = (rect) => {
        const widthReduction = rect.width * 0.25;
        const heightReduction = rect.height * 0.25;
        return {
            left: rect.left + widthReduction,
            right: rect.right - widthReduction,
            top: rect.top + heightReduction,
            bottom: rect.bottom - heightReduction
        };
    };

    const adjusted1 = adjustCollisionBox(rect1);
    const adjusted2 = adjustCollisionBox(rect2);

    return (
        adjusted1.left < adjusted2.right &&
        adjusted1.right > adjusted2.left &&
        adjusted1.top < adjusted2.bottom &&
        adjusted1.bottom > adjusted2.top
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
    clearInterval(enemySpawnInterval);
    restartButton.style.display = 'block';
    gambleButton.style.display = 'none';
    pauseButton.style.display = 'none';
    mainMenuButton.style.display = 'block';gambleMenu.style.display = 'none';

    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    projectiles.forEach(projectile => projectile.remove());
    enemies = [];
    powerups = [];
    projectiles = [];

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

    // Stop the game loop
    cancelAnimationFrame(gameLoopId);
    
    // Pause background music
    pauseBackgroundMusic();
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

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.tagName === 'BUTTON') {
        element.click();
    } else if (gameActive && !gamePaused) {
        handleShoot(event);
    }
}

function toggleGamble() {
    if (gambleMenu.style.display === 'none') {
        gambleMenu.style.display = 'block';
        gamePaused = true;
    } else {
        gambleMenu.style.display = 'none';
        gamePaused = false;
        lastFrameTime = performance.now();
        gameLoop(lastFrameTime);
    }
    // Remove pauseBackgroundMusic and playBackgroundMusic calls from here
}

function gamble() {
    if (coins >= 5) {
        coins -= 5;
        const chance = Math.random();
        sounds.powerSurge.play().catch(e => console.log("Audio play failed:", e));
        
        let winAmount = 0;
        let resultMessage = '';

        if (chance < 0.01) {
            winAmount = 100;
            resultMessage = "Jackpot! Cosmic alignment achieved! Gained 100 coins!";
        } else if (chance < 0.1) {
            winAmount = 25;
            resultMessage = "Major power surge! Gained 25 coins!";
        } else if (chance < 0.3) {
            winAmount = 10;
            resultMessage = "Power surge successful! Gained 10 coins!";
        } else if (chance < 0.6) {
            winAmount = 5;
            resultMessage = "Minor power boost. Gained 5 coins.";
        } else {
            resultMessage = "Power surge failed. No boost received.";
        }
        
        coins += winAmount;
        
        gambleResult.textContent = resultMessage;
        
        updateCoins();

        // Special effects for big wins
        if (winAmount >= 25) {
            createFireworks();
        }
    } else {
        gambleResult.textContent = "Not enough coins for a power surge!";
    }
}

function createFireworks() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '5px';
            particle.style.height = '5px';
            particle.style.backgroundColor= `hsl(${Math.random() * 360}, 100%, 50%)`;
            particle.style.borderRadius = '50%';
            particle.style.left = `${Math.random() * gameContainer.clientWidth}px`;
            particle.style.top = `${Math.random() * gameContainer.clientHeight}px`;
            gameArea.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100 + 50;
            const lifetime = Math.random() * 1000 + 500;

            setTimeout(() => {
                particle.remove();
            }, lifetime);

            animateFirework(particle, angle, speed);
        }, Math.random() * 1000);
    }
}

function animateFirework(particle, angle, speed) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);
    let velocity = speed;
    const gravity = 98; // pixels per second squared

    function update(time) {
        const deltaTime = (time - lastFrameTime) / 1000;
        lastFrameTime = time;

        x += Math.cos(angle) * velocity * deltaTime;
        y += Math.sin(angle) * velocity * deltaTime;
        velocity -= gravity * deltaTime;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        if (particle.parentNode) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function showInstructions() {
    instructionsMenu.style.display = 'block';
    gamePaused = true;
    // Remove pauseBackgroundMusic call from here
}

function showControls() {
    controlsMenu.style.display = 'block';
    gamePaused = true;
    // Remove pauseBackgroundMusic call from here
}

function togglePause() {
    gamePaused = !gamePaused;
    if (!gamePaused) {
        lastFrameTime = performance.now();
        gameLoop(lastFrameTime);
    }
    pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
    // Remove pauseBackgroundMusic and playBackgroundMusic calls from here
}

function backToMainMenu() {
    gameActive = false;
    gamePaused = false;
    clearInterval(enemySpawnInterval);
    enemies.forEach(enemy => enemy.remove());
    powerups.forEach(powerup => powerup.remove());
    projectiles.forEach(projectile => projectile.remove());
    enemies = [];
    powerups = [];
    projectiles = [];
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
    
    const gameOverMessage = document.getElementById('game-over-message');
    if (gameOverMessage) {
        gameOverMessage.remove();
    }

    pauseBackgroundMusic();
}

function createProjectile(x, y) {
    if (coins > 0) {
        const projectile = document.createElement('div');
        projectile.classList.add('projectile');
        projectile.style.left = `${x}px`;
        projectile.style.top = `${y}px`;
        gameArea.appendChild(projectile);
        projectiles.push(projectile);
        coins--;
        updateCoins();
        return true;
    }
    return false;
}

function handleShoot(event) {
    if (!gameActive || gamePaused) return;
    event.preventDefault();

    const rect = gameContainer.getBoundingClientRect();
    let shootX;

    if (event.type === 'click') {
        shootX = event.clientX - rect.left;
    } else if (event.type === 'touchstart') {
        shootX = event.touches[0].clientX - rect.left;
    }

    // Determine which player should shoot based on the touch/click position
    const shooterX = (shootX < rect.width / 2) ? player1X : player2X;
    
    if (!createProjectile(shooterX, gameContainer.clientHeight - 50)) {
        // Optionally, add feedback when out of coins
        console.log("Out of coins!");
    }
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
gameContainer.addEventListener('mousemove', handleMouseMove);
gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
gambleButton.addEventListener('click', toggleGamble);
gambleActionButton.addEventListener('click', gamble);
closeGambleButton.addEventListener('click', toggleGamble);
instructionsButton.addEventListener('click', showInstructions);
closeInstructionsButton.addEventListener('click', () => {
    instructionsMenu.style.display = 'none';
    gamePaused = false;
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
    resumeBackgroundMusic();
});
controlsButton.addEventListener('click', showControls);
closeControlsButton.addEventListener('click', () => {
    controlsMenu.style.display = 'none';
    gamePaused = false;
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
    resumeBackgroundMusic();
});
pauseButton.addEventListener('click', togglePause);
mainMenuButton.addEventListener('click', backToMainMenu);
gameContainer.addEventListener('click', handleShoot);
gameContainer.addEventListener('touchstart', handleShoot, { passive: false });

gambleMenu.style.display = 'none';
updateCoins();

initializeSounds();

// Add a new button for toggling background music
const musicToggleButton = document.createElement('button');
musicToggleButton.id = 'music-toggle';
musicToggleButton.textContent = 'Mute Music';
musicToggleButton.style.position = 'absolute';
musicToggleButton.style.bottom = '20px';
musicToggleButton.style.left = '50%';
musicToggleButton.style.transform = 'translateX(-50%)';
musicToggleButton.style.zIndex = '1000';
musicToggleButton.style.marginBottom = '60px'; // Add space above the other bottom buttons
gameContainer.appendChild(musicToggleButton);

musicToggleButton.addEventListener('click', toggleBackgroundMusic);

// Start the game loop
lastFrameTime = performance.now();
gameLoop(lastFrameTime);




