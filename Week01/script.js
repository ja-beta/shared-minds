const inputBox = document.getElementById('inputBox');
const canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d'); 
let usedPositions = new Set(); 
let letterPositions = new Map(); 
let cellWidth, cellHeight; 
let recentInputLength = 0;

inputBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        spreadWordsRandomly();
        console.log(letterPositions.size);
    }
});

// LETTERS

function spreadLettersRandomly() {
    const inputValue = inputBox.value.split('');
    const numRows = 12;
    const numCols = 12;
    const numCells = numRows * numCols;
    cellWidth = canvas.width / numCols;
    cellHeight = canvas.height / numRows;
    const minFontSize = 12; 
    const maxFontSize = 32; 

    if (inputValue.length + usedPositions.size > numCells) {
        const lettersToRemove = inputValue.length + usedPositions.size - numCells;
        removeLetters(lettersToRemove);
    }

    inputValue.forEach(letter => {
        let position, x, y, row, col;
        do {
            row = Math.floor(Math.random() * numRows);
            col = Math.floor(Math.random() * numCols);
            position = `${row}-${col}`;
        } while (usedPositions.has(position));

        usedPositions.add(position);
        letterPositions.set(position, letter);

        const fontSize = Math.floor(Math.random() * (maxFontSize - minFontSize + 1)) + minFontSize;
        ctx.font = `${fontSize}px Helvetica`;

        const clearX = col * cellWidth;
        const clearY = row * cellHeight;

        ctx.clearRect(clearX, clearY, cellWidth, cellHeight);

        x = col * cellWidth + (cellWidth / 2);
        y = row * cellHeight + (cellHeight / 2) + (fontSize / 2); 

        ctx.fillText(letter, x, y);
    });

    recentInputLength = inputValue.length;
    inputBox.value = '';
}

function removeLetters(count) {
    for (let position of usedPositions) {
        if (count === 0) break;
        usedPositions.delete(position);
        letterPositions.delete(position);
        count--;
        if (count === 0) break;
    }
}


// WORDS

function spreadWordsRandomly() {
    const inputValue = inputBox.value.split(' '); 
    const numRows = 6; 
    const numCols = 6; 
    const numCells = numRows * numCols;
    cellWidth = canvas.width / numCols;
    cellHeight = canvas.height / numRows;
    const minFontSize = 12;
    const maxFontSize = 32;

    if (inputValue.length + usedPositions.size > numCells) {
        const wordsToRemove = inputValue.length + usedPositions.size - numCells;
        removeWords(wordsToRemove);
    }

    inputValue.forEach(word => {
        let position, x, y, row, col;
        do {
            row = Math.floor(Math.random() * numRows);
            col = Math.floor(Math.random() * numCols);
            position = `${row}-${col}`;
        } while (usedPositions.has(position));

        usedPositions.add(position);
        letterPositions.set(position, word);

        const fontSize = Math.floor(Math.random() * (maxFontSize - minFontSize + 1)) + minFontSize;
        ctx.font = `${fontSize}px Helvetica`;

        const clearX = col * cellWidth;
        const clearY = row * cellHeight;

        ctx.clearRect(clearX, clearY, cellWidth, cellHeight);

        x = col * cellWidth + (cellWidth / 2);
        y = row * cellHeight + (cellHeight / 2) + (fontSize / 2);

        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(word, x, y);
    });

    recentInputLength = inputValue.length;
    inputBox.value = '';
}

function removeWords(count) {
    for (let position of usedPositions) {
        if (count === 0) break;
        usedPositions.delete(position);
        letterPositions.delete(position);
        count--;
        if (count === 0) break;
    }
}