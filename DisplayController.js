const DisplayController = function(board) { 
    let boardData;
    let cells = [];
    const gameboardQuery = document.querySelector(".gameboard");
    const resetBtnQuery = document.querySelector("#resetButton");
    const winnerRibbonQuery = document.querySelector(".ribbon");
    const scoreboardPlayerO = document.querySelector("#player-o > p");
    const scoreboardPlayerX = document.querySelector("#player-x > p");
    const scoreboardDraws = document.querySelector("#draws > p");
    const playAgainPrompt = document.createElement("a");
    playAgainPrompt.id = "playAgain";
    playAgainPrompt.textContent = "Play again?";

    pubsub.subscribe("boardInit", onBoardInit);
    pubsub.subscribe("playerMove", renderMove);
    pubsub.subscribe("boardClear", clearBoard);
    pubsub.subscribe("gameEnd", onGameEnd);
    
    function onBoardInit(boardState) {
        buildGameboardNodes(boardState);
        addGameboardListener();
        hideWinnerRibbon();
    }

    function onGameEnd({ condition, name, score } ) {
        removeGameboardListener();
        updateScoreboard(condition, name, score);
        showWinnerRibbon(condition, name);
    }

    resetBtnQuery.addEventListener("click", e => {
        pubsub.publish("resetGame");
        resetScoreboard();
    });
    
    function updateScoreboard(condition, name, score) {
        if (condition === "draw") {
            scoreboardDraws.textContent = score;
        } else {
            if (name === "Player O") {
                scoreboardPlayerO.textContent = score;
            } else if (name === "Player X") {
                scoreboardPlayerX.textContent = score;
            }
        }
    }

    function resetScoreboard() {
        scoreboardPlayerO.textContent = 0;
        scoreboardPlayerX.textContent = 0;
        scoreboardDraws.textContent = 0;
    }

    function addGameboardListener() {
        gameboardQuery.addEventListener("click", handleCellClick);
        gameboardQuery.setAttribute("data-active", true);            
    }

    function removeGameboardListener() {
        gameboardQuery.removeEventListener("click", handleCellClick);
        gameboardQuery.setAttribute("data-active", false);
    }

    function handleCellClick(e) {
        const row = e.target.getAttribute("data-row");
        const col = e.target.getAttribute("data-col");
        if (row) {
            pubsub.publish("cellClick", [parseInt(row), parseInt(col)]);
        }
    }
    
    function buildGameboardNodes(boardState) {
        boardData = boardState;
        const size = boardState.length;
        for (let i = 0; i < size; i++) {
            cells[i] = [];

            for (let j = 0; j < size; j++) {
                cells[i].push(document.createElement("div"));
                cells[i][j].setAttribute("data-row", i);
                cells[i][j].setAttribute("data-col", j);
                cells[i][j].classList.add("cell");
                gameboardQuery.appendChild(cells[i][j]);
            }
        }
    }

    function renderMove({ token, row, col }) {
        const playerToken = new Image();
        
        if (token === 1) {
            playerToken.src = "./assets/circle.svg";
            playerToken.classList.add("circle")
        } else {
            playerToken.src = "./assets/cross.svg";
            playerToken.classList.add("cross")
        }
        cells[row][col].appendChild(playerToken);
    }

    function clearBoard() {
        gameboardQuery.replaceChildren();
    }

     function showWinnerRibbon(condition, name) {
        let ribbonText = "Game over. ";
        if (condition === "win")
        {
            ribbonText += `${name} wins! `;
        } else {
            ribbonText += `It's a draw! `
        }
        winnerRibbonQuery.textContent = ribbonText;
        winnerRibbonQuery.appendChild(playAgainPrompt);

        playAgainPrompt.addEventListener("click", () => {
            pubsub.publish("newGame");
        }, { once: true });

        winnerRibbonQuery.style.visibility = "visible";
        winnerRibbonQuery.setAttribute("data-active", true);    
     }

     function hideWinnerRibbon() {
        winnerRibbonQuery.textContent = "";

        // Remove all event listeners
        playAgainPrompt.replaceWith(playAgainPrompt.cloneNode(true));

        winnerRibbonQuery.style.visibility = "hidden";
        winnerRibbonQuery.setAttribute("data-active", false); 
     }
}();