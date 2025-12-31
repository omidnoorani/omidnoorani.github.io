const WORD_LIST = [
    { id: "8A21", word: "REACT" },
    { id: "4B90", word: "PLATE" },
    { id: "1F34", word: "SOUND" },
    { id: "9D22", word: "GHOST" },
    { id: "5E11", word: "LIGHT" },
    { id: "2C88", word: "BRICK" }
];

let targetWordObj = {};
let currentGuess = "";
let guesses = [];
const MAX_GUESSES = 6;

// Initialize Game
function initGame() {
    targetWordObj = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    currentGuess = "";
    guesses = [];
    
    document.getElementById("word-id-display").innerText = `ID: #${targetWordObj.id}`;
    document.getElementById("board").innerHTML = "";
    createBoard();
    createKeyboard();
    document.getElementById("modal").classList.add("hidden");
}

function createBoard() {
    const board = document.getElementById("board");
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

// Logic to check guess
function submitGuess() {
    if (currentGuess.length !== 5) return;

    // Optional: Dictionary validation check could go here
    const rowIdx = guesses.length;
    const targetArr = targetWordObj.word.split("");
    const guessArr = currentGuess.toUpperCase().split("");
    const rowTiles = document.querySelectorAll(`#board .row`)[rowIdx].children;

    // First pass: Find Green (Correct)
    let tempTarget = [...targetArr];
    let results = Array(5).fill("absent");

    guessArr.forEach((letter, i) => {
        if (letter === tempTarget[i]) {
            results[i] = "correct";
            tempTarget[i] = null; // Mark as used
        }
    });

    // Second pass: Find Yellow (Present)
    guessArr.forEach((letter, i) => {
        if (results[i] !== "correct" && tempTarget.includes(letter)) {
            results[i] = "present";
            tempTarget[tempTarget.indexOf(letter)] = null;
        }
    });

    // Update UI
    results.forEach((status, i) => {
        rowTiles[i].classList.add(status);
        updateKeyboardUI(guessArr[i], status);
    });

    guesses.push(currentGuess);
    
    if (currentGuess.toUpperCase() === targetWordObj.word) {
        showModal("Winner!", `You found ${targetWordObj.word} in ${guesses.length} tries.`);
    } else if (guesses.length === MAX_GUESSES) {
        showModal("Game Over", `The word was ${targetWordObj.word}.`);
    }

    currentGuess = "";
}

// Handle Inputs
window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuess();
    if (e.key === "Backspace") backspace();
    if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key);
});

function addLetter(letter) {
    if (currentGuess.length < 5 && guesses.length < MAX_GUESSES) {
        currentGuess += letter.toUpperCase();
        updateRowUI();
    }
}

function backspace() {
    currentGuess = currentGuess.slice(0, -1);
    updateRowUI();
}

function updateRowUI() {
    const rowIdx = guesses.length;
    const rowTiles = document.querySelectorAll(`#board .row`)[rowIdx].children;
    for (let i = 0; i < 5; i++) {
        rowTiles[i].innerText = currentGuess[i] || "";
    }
}

// Keyboard Generation
function createKeyboard() {
    const rows = ["QWERTYUIOP", "ASDFGHJKL", "EnterZXCVBNM⌫"];
    rows.forEach((rowStr, i) => {
        const rowEl = document.getElementById(`row${i + 1}`);
        rowEl.innerHTML = "";
        rowStr.split("").forEach(char => {
            const btn = document.createElement("button");
            btn.className = "key";
            btn.innerText = char === "⌫" ? "DEL" : char;
            if (char === "Enter" || char === "⌫") btn.classList.add("wide");
            
            btn.onclick = () => {
                if (char === "Enter") submitGuess();
                else if (char === "⌫") backspace();
                else addLetter(char);
            };
            rowEl.appendChild(btn);
        });
    });
}

function updateKeyboardUI(letter, status) {
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        if (key.innerText === letter || (letter === "DEL" && key.innerText === "⌫")) {
            if (!key.classList.contains("correct")) {
                key.className = `key ${status}`;
            }
        }
    });
}

function showModal(title, msg) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-message").innerText = msg;
    document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("new-game-btn").onclick = initGame;
document.getElementById("modal-close").onclick = initGame;

initGame();