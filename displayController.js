const DisplayController = function(board) { 
    let boardData;
    let cells = [];
    const gameboardQuery = document.querySelector(".gameboard");
    const newGameBtnQuery = document.querySelector("#newGameButton");
    
    pubsub.subscribe("boardInit", buildCellNodes);
    pubsub.subscribe("playerMove", renderMove);
    pubsub.subscribe("boardClear", clearBoard);

    // Event listener for Gameboard cells
    gameboardQuery.addEventListener("click", e => {
        const row = e.target.getAttribute("data-row");
        const col = e.target.getAttribute("data-col");
        if (row) {
            pubsub.publish("cellClick", [parseInt(row), parseInt(col)]);
        }
    });

    newGameBtnQuery.addEventListener("click", e => {
        pubsub.publish("newGame");
    });
    
    function buildCellNodes(boardState) {
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
        cells[row][col].textContent = token;
    }

    function clearBoard() {
        gameboardQuery.replaceChildren();
    }
}();