import { DICTIONARY } from './words.js';

let targetWord = "";
let currentGuess = "";
let guesses = [];
let timerInterval;
let seconds = 0;
const MAX_GUESSES = 6;

/**
 * Hashing: Two-way mapping
 * Word -> Index -> Base36 ID
 * ID -> Base36 Index -> Word
 */
const encodeId = (index) => index.toString(36).toUpperCase();
const decodeId = (id) => parseInt(id, 36);

function initGame() {
    const hash = window.location.hash.replace('#', '').toUpperCase();
    let wordIndex;

    // 3. Hash/URL Logic
    if (hash) {
        wordIndex = decodeId(hash);
        // Validate if decoded index exists in dictionary
        if (DICTIONARY[wordIndex]) {
            targetWord = DICTIONARY[wordIndex].toUpperCase();
        } else {
            // Fallback if ID is invalid
            selectRandomWord();
        }
    } else {
        selectRandomWord();
    }

    resetState();
}

function selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * DICTIONARY.length);
    targetWord = DICTIONARY[randomIndex].toUpperCase();
    // Update URL without reloading
    window.location.hash = encodeId(randomIndex);
}

function resetState() {
    currentGuess = "";
    guesses = [];
    seconds = 0;
    clearInterval(timerInterval);
    startTimer();
    
    document.getElementById("word-id-display").innerText = `ID: #${window.location.hash.replace('#', '')}`;
    document.getElementById("board").innerHTML = "";
    createBoard();
    createKeyboard();
    document.getElementById("modal").classList.add("hidden");
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        document.getElementById("timer").innerText = `Time: ${mins}:${secs}`;
    }, 1000);
}

function submitGuess() {
    const guessUpper = currentGuess.toUpperCase();
    
    if (guessUpper.length !== 5) return;

    // 4. Validation (Combined List)
    if (!DICTIONARY.includes(guessUpper)) {
        alert("Not in word list!");
        return;
    }

    const rowIdx = guesses.length;
    const targetArr = targetWord.split("");
    const guessArr = guessUpper.split("");
    const rowTiles = document.querySelectorAll(`#board .row`)[rowIdx].children;

    let tempTarget = [...targetArr];
    let results = Array(5).fill("absent");

    // Pass 1: Green (Correct Position)
    guessArr.forEach((letter, i) => {
        if (letter === tempTarget[i]) {
            results[i] = "correct";
            tempTarget[i] = null;
        }
    });

    // Pass 2: Yellow (Wrong Position)
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
    
    if (guessUpper === targetWord) {
        clearInterval(timerInterval);
        showModal("Winner!", `Word found in ${document.getElementById("timer").innerText}`);
    } else if (guesses.length === MAX_GUESSES) {
        clearInterval(timerInterval);
        showModal("Game Over", `The word was ${targetWord}.`);
    }

    currentGuess = "";
}

// Keyboard and Input logic
function createKeyboard() {
    const layout = [
        "QWERTYUIOP".split(""),
        "ASDFGHJKL".split(""),
        ["ENTER", ..."ZXCVBNM".split(""), "DEL"]
    ];

    layout.forEach((row, i) => {
        const rowEl = document.getElementById(`row${i + 1}`);
        rowEl.innerHTML = "";
        row.forEach(key => {
            const btn = document.createElement("button");
            btn.className = "key";
            if (key === "ENTER" || key === "DEL") btn.classList.add("wide");
            btn.innerText = key;
            btn.onclick = () => handleInput(key);
            rowEl.appendChild(btn);
        });
    });
}

function handleInput(key) {
    const keyUpper = key.toUpperCase();
    if (keyUpper === "ENTER") submitGuess();
    else if (keyUpper === "DEL" || keyUpper === "BACKSPACE") backspace();
    else if (/^[A-Z]$/.test(keyUpper)) addLetter(keyUpper);
}

window.addEventListener("keydown", (e) => handleInput(e.key));

function addLetter(letter) {
    if (currentGuess.length < 5 && guesses.length < MAX_GUESSES) {
        currentGuess += letter;
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

function updateKeyboardUI(letter, status) {
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        if (key.innerText === letter) {
            if (status === "correct") {
                key.className = "key correct";
            } else if (status === "present" && !key.classList.contains("correct")) {
                key.className = "key present";
            } else if (status === "absent" && !key.classList.contains("correct") && !key.classList.contains("present")) {
                key.className = "key absent";
            }
        }
    });
}

function createBoard() {
    const board = document.getElementById("board");
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function showModal(title, msg) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-message").innerText = msg;
    document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("new-game-btn").onclick = selectRandomWord;
document.getElementById("modal-close").onclick = selectRandomWord;

// Sync game if user changes the URL hash manually
window.onhashchange = initGame;

initGame();