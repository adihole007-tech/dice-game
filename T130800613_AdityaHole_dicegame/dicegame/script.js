const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const selectBtns = document.querySelectorAll('.select-btn');
const rollBtn = document.getElementById('roll-btn');
const resetBtn = document.getElementById('reset-btn');
const die1 = document.getElementById('die-1');
const die2 = document.getElementById('die-2');
const roundScoreEl = document.getElementById('round-score');
const currentPlayerNameEl = document.getElementById('current-player-name');
const scoreboardEl = document.getElementById('scoreboard');

// Game State
let state = {
    players: [], // Array of player objects { id: 1, score: 0, name: "Player 1" }
    currentPlayerIndex: 0,
    isRolling: false,
    targetScore: 50,
    gameActive: false
};

const faceRotations = {
    1: [0, 0],
    2: [90, 0],
    3: [0, -90],
    4: [0, 90],
    5: [-90, 0],
    6: [0, 180]
};

// Setup Event Listeners
selectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const numPlayers = parseInt(btn.dataset.players);
        startGame(numPlayers);
    });
});

rollBtn.addEventListener('click', rollDice);
resetBtn.addEventListener('click', resetGame);

function startGame(numPlayers) {
    // Initialize state
    state.players = Array.from({ length: numPlayers }, (_, i) => ({
        id: i + 1,
        score: 0,
        name: `Player ${i + 1}`
    }));
    state.currentPlayerIndex = 0;
    state.gameActive = true;
    state.isRolling = false;

    // Update UI
    setupScreen.classList.remove('active');
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('active');

    resetBtn.classList.add('hidden');
    rollBtn.disabled = false;
    rollBtn.textContent = "ROLL DICE";
    roundScoreEl.textContent = "0";

    renderScoreboard();
    updateTurnIndicator();
}

function resetGame() {
    state.gameActive = false;
    gameScreen.classList.remove('active');
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    setupScreen.classList.add('active');
}

function renderScoreboard() {
    scoreboardEl.innerHTML = '';
    state.players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `player-card ${index === state.currentPlayerIndex ? 'active' : ''}`;
        if (player.score >= state.targetScore) card.classList.add('winner');

        card.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score}</span>
        `;
        scoreboardEl.appendChild(card);
    });
}

function updateTurnIndicator() {
    const player = state.players[state.currentPlayerIndex];
    currentPlayerNameEl.textContent = player.name;

    // Update active class on scoreboard
    const cards = scoreboardEl.children;
    for (let i = 0; i < cards.length; i++) {
        if (i === state.currentPlayerIndex) {
            cards[i].classList.add('active');
        } else {
            cards[i].classList.remove('active');
        }
    }
}

function getRandomFace() {
    return Math.floor(Math.random() * 6) + 1;
}

let die1CurrentRotation = { x: 0, y: 0 };
let die2CurrentRotation = { x: 0, y: 0 };

function rollDice() {
    if (state.isRolling || !state.gameActive) return;

    state.isRolling = true;
    rollBtn.disabled = true;
    rollBtn.textContent = "Rolling...";

    const result1 = getRandomFace();
    const result2 = getRandomFace();

    animateDie(die1, result1, die1CurrentRotation);
    animateDie(die2, result2, die2CurrentRotation);

    setTimeout(() => {
        handleRollResult(result1 + result2);
    }, 1000);
}

function animateDie(dieElement, result, currentRotation) {
    const target = faceRotations[result];
    const spins = 5;

    const mod = (n, m) => ((n % m) + m) % m;

    const newX = currentRotation.x + (360 * spins) + (target[0] - mod(currentRotation.x, 360));
    const newY = currentRotation.y + (360 * spins) + (target[1] - mod(currentRotation.y, 360));

    dieElement.style.transform = `rotateX(${newX}deg) rotateY(${newY}deg)`;

    currentRotation.x = newX;
    currentRotation.y = newY;
}

function handleRollResult(total) {
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Update round score display
    roundScoreEl.textContent = total;

    // Update player score
    currentPlayer.score += total;

    renderScoreboard();

    // Check win condition
    if (currentPlayer.score >= state.targetScore) {
        endGame(currentPlayer);
    } else {
        // Next turn
        state.isRolling = false;
        rollBtn.disabled = false;
        rollBtn.textContent = "ROLL DICE"; // Or "Next Player"

        // Switch player
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        updateTurnIndicator();
    }
}

function endGame(winner) {
    state.gameActive = false;
    rollBtn.textContent = `${winner.name} Wins!`;
    currentPlayerNameEl.textContent = "Winner: " + winner.name;

    // Highlight winner in scoreboard
    renderScoreboard();

    resetBtn.classList.remove('hidden');
}
