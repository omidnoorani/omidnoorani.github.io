// ... (Keep encode/decode and initGame from previous version)

async function submitGuess() {
    const guessUpper = currentGuess.toUpperCase();
    if (guessUpper.length !== 5) return;

    const rowIdx = guesses.length;
    const rowEl = document.querySelectorAll('.row')[rowIdx];
    const rowTiles = rowEl.children;

    // Validation Check with Shake
    if (!DICTIONARY.includes(guessUpper)) {
        rowEl.classList.add('shake');
        setTimeout(() => rowEl.classList.remove('shake'), 500);
        return;
    }

    const targetArr = targetWord.split("");
    const guessArr = guessUpper.split("");
    let tempTarget = [...targetArr];
    let results = Array(5).fill("absent");

    // Calculate results (Logic remains same as previous version)
    guessArr.forEach((l, i) => { if (l === tempTarget[i]) { results[i] = "correct"; tempTarget[i] = null; }});
    guessArr.forEach((l, i) => { if (results[i] !== "correct" && tempTarget.includes(l)) { results[i] = "present"; tempTarget[tempTarget.indexOf(l)] = null; }});

    // Staggered Flip Animation
    for (let i = 0; i < 5; i++) {
        const tile = rowTiles[i];
        tile.classList.add('flip');
        
        // Wait for mid-point of flip to change color
        await new Promise(r => setTimeout(r, 250));
        tile.classList.add(results[i]);
        updateKeyboardUI(guessArr[i], results[i]);
        
        await new Promise(r => setTimeout(r, 250));
    }

    guesses.push(currentGuess);
    
    if (guessUpper === targetWord) {
        clearInterval(timerInterval);
        setTimeout(() => showModal("Splendid!", `Solved in ${document.getElementById("timer").innerText}`), 500);
    } else if (guesses.length === MAX_GUESSES) {
        clearInterval(timerInterval);
        setTimeout(() => showModal("Game Over", `Word was: ${targetWord}`), 500);
    }

    currentGuess = "";
}

function addLetter(letter) {
    if (currentGuess.length < 5 && guesses.length < MAX_GUESSES) {
        currentGuess += letter.toUpperCase();
        const rowIdx = guesses.length;
        const tile = document.querySelectorAll('.row')[rowIdx].children[currentGuess.length - 1];
        tile.innerText = currentGuess[currentGuess.length - 1];
        tile.setAttribute('data-state', 'active');
    }
}

function backspace() {
    if (currentGuess.length > 0) {
        const rowIdx = guesses.length;
        const tile = document.querySelectorAll('.row')[rowIdx].children[currentGuess.length - 1];
        tile.innerText = "";
        tile.removeAttribute('data-state');
        currentGuess = currentGuess.slice(0, -1);
    }
}