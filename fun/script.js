import { WORD_LIST, VALID_WORDS } from './words.js';

let targetWordObj = {};
let currentGuess = "";
let guesses = [];
let timerInterval;
let seconds = 0;
const MAX_GUESSES = 6;

function initGame() {
    // 3. Selection via Hash/Anchor
    const hash = window.location.hash.replace('#', '');
    const foundWord = WORD_LIST.find(w => w.id === hash);
    
    if (foundWord) {
        targetWordObj = foundWord;
    } else {
        targetWordObj = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        window.location.hash = targetWordObj.id;
    }

    // Reset State
    currentGuess = "";
    guesses = [];
    seconds = 0;
    clearInterval(timerInterval);
    startTimer();
    
    document.getElementById("word-id-display").innerText = `ID: #${targetWordObj.id}`;
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

    // 4. Invalid Word Check
    if (!VALID_WORDS.includes(guessUpper) && !WORD_LIST.some(w => w.word === guessUpper)) {
        alert("Not in word list!");
        return;
    }

    const rowIdx = guesses.length;
    const targetArr = targetWordObj.word.split("");
    const guessArr = guessUpper.split("");
    const rowTiles = document.querySelectorAll(`#board .row`)[rowIdx].children;

    let tempTarget = [...targetArr];
    let results = Array(5).fill("absent");

    // Pass 1: Green
    guessArr.forEach((letter, i) => {
        if (letter === tempTarget[i]) {
            results[i] = "correct";
            tempTarget[i] = null;
        }
    });

    // Pass 2: Yellow
    guessArr.forEach((letter, i) => {
        if (results[i] !== "correct" && tempTarget.includes(letter)) {
            results[i] = "present";
            tempTarget[tempTarget.indexOf(letter)] = null;
        }
    });

    results.forEach((status, i) => {
        rowTiles[i].classList.add(status);
        updateKeyboardUI(guessArr[i], status);
    });

    guesses.push(currentGuess);
    
    if (guessUpper === targetWordObj.word) {
        clearInterval(timerInterval);
        showModal("Winner!", `ID #${targetWordObj.id} solved in ${document.getElementById("timer").innerText}`);
    } else if (guesses.length === MAX_GUESSES) {
        clearInterval(timerInterval);
        showModal("Game Over", `The word was ${targetWordObj.word}.`);
    }

    currentGuess = "";
}

// 1. Fixed Keyboard Layout
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
    if (key === "ENTER" || key === "Enter") submitGuess();
    else if (key === "DEL" || key === "Backspace") backspace();
    else if (/^[a-zA-Z]$/.test(key)) addLetter(key);
}

window.addEventListener("keydown", (e) => handleInput(e.key));

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

function showModal(title, msg) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-message").innerText = msg;
    document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("new-game-btn").onclick = () => {
    window.location.hash = ""; // Clear hash to get a random word
    initGame();
};
document.getElementById("modal-close").onclick = initGame;

// Listen for URL changes (allows users to paste an ID in the URL bar)
window.onhashchange = initGame;

initGame();