const DisplayController = function(board) { 
    let boardData;
    let cells = [];
    const gameboardQuery = document.querySelector(".gameboard");
    const newGameBtnQuery = document.querySelector("#newGameButton");
    const winnerRibbonQuery = document.querySelector(".ribbon");

    pubsub.subscribe("boardInit", onBoardInit);
    pubsub.subscribe("boardInit", toggleWinnerRibbon)
    pubsub.subscribe("playerMove", renderMove);
    pubsub.subscribe("boardClear", clearBoard);
    pubsub.subscribe("gameEnd", onGameEnd);
    
    function onBoardInit(boardState) {
        buildGameboardNodes(boardState);
        toggleGameboardListener();
    }

    function onGameEnd(winnerName) {
        toggleGameboardListener();
        toggleWinnerRibbon(winnerName);
    }

    newGameBtnQuery.addEventListener("click", e => {
        pubsub.publish("newGame");
    });
    
    function toggleGameboardListener() {
        const isActive = gameboardQuery.getAttribute("data-active");

        if (!isActive || isActive === "false") {
            gameboardQuery.addEventListener("click", handleCellClick);
            gameboardQuery.setAttribute("data-active", true);            
        } else {
            gameboardQuery.removeEventListener("click", handleCellClick);
            gameboardQuery.setAttribute("data-active", false);
        }
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
            playerToken.src = "circle.svg";
            playerToken.classList.add("circle")
        } else {
            playerToken.src = "cross.svg";
            playerToken.classList.add("cross")
        }
        cells[row][col].appendChild(playerToken);
    }

    function clearBoard() {
        gameboardQuery.replaceChildren();
    }

    function toggleWinnerRibbon(name) {
        const isActive = winnerRibbonQuery.getAttribute("data-active");

        if (!isActive || isActive === "true") {
            winnerRibbonQuery.textContent = "";
            winnerRibbonQuery.style.display = "none";
            winnerRibbonQuery.setAttribute("data-active", false); 
        }
        else {
            winnerRibbonQuery.textContent = `Game over. ${name} wins!`;
            winnerRibbonQuery.style.display = "block";
            winnerRibbonQuery.setAttribute("data-active", true);            
        }
     }
}();