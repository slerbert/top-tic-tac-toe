const Gameboard = function(boardSize = 3) {
    let boardData = [];
    let primaryDiagonal = [];
    let secondaryDiagonal = [];

    init(boardSize);

    pubsub.subscribe("newGame", clear);
    pubsub.subscribe("newGame", init);
    
    function init(boardSize = 3) {        
        // Initialize board and record diagonal indices
        for (let i = 0; i < boardSize; i++) {
            boardData[i] = [];
            primaryDiagonal.push([i, i]);
            secondaryDiagonal.push([i, boardSize - i - 1]);
    
            for (let j = 0; j < boardSize; j++) {
                boardData[i].push(0);
            }
        }
        pubsub.publish("boardInit", boardData);
    }

    function clear() {
        boardData = [];
        primaryDiagonal = [];
        secondaryDiagonal = [];

        pubsub.publish("boardClear", boardData);
    }

    function evaluateWin(player, [row, col]) {
        // If player's token == 1, they'll win when any of the below return 3
        // If player's token == -1, they'll win if any return -3
        const winCondition = player.getToken() * 3;
        
        const colSum = getTokenSum(col, "column");
        const rowSum = getTokenSum(row, "row");
        const primaryDiagSum = getTokenSum([row, col], primaryDiagonal);
        const secondaryDiagSum = getTokenSum([row, col], secondaryDiagonal);
        
        return rowSum === winCondition || colSum === winCondition || primaryDiagSum === winCondition || secondaryDiagSum === winCondition;        
    }

    function containsSubArray(array, subarray) {
        return array.some(a => subarray.every((v, i) => v === a[i]));
    }

    function getTokenSum(index, axis = null) {
        if (typeof index === "object") {
            let diagonalSum = 0;
            if (containsSubArray(axis, index)) {
                diagonalSum = axis.reduce(
                    (prev, current) => prev + boardData[current[0]][current[1]], 0
                );
            }
            return diagonalSum;
        } else if (axis === "column") {
            return boardData.reduce((a, b) => a + b[index], 0);
        } else {
            return boardData[index].reduce((a, b) => a + b, 0);
        }
    }

    function getBoard() {
        return boardData;
    }

    function getBoardSize() {
        return boardSize;
    }

    function setBoardSize(size) {
        if (size > 1 && size <= 9) {
            boardSize = size;
        }
    }
    
    function update(player, [row, col]) {
        const token = player.getToken();
        boardData[row][col] = token;
        pubsub.publish("playerMove", { token, row, col });
    }

    function validateMove([row, col]) {
        return boardData[row][col] === 0;
    }
    
    return { init, clear, evaluateWin, getBoard, getBoardSize, update, validateMove };
}();

const GameController = function() {
    let player1, player2, activePlayer;

    const playGame = function() {
        isPlayable = true;
        const randomToken = Math.random() >= 0.5;
        player1 = createPlayer("Player A", randomToken);
        player2 = createPlayer("Player B", !randomToken);
        activePlayer = player1;
    };

    const endGame = function(name) {
        pubsub.publish("gameEnd", name);
    }

    const playRound = function([row, col]) {       
        let playerMove = [row, col];
        let isValidMove = Gameboard.validateMove(playerMove);

        if (isValidMove) {
            Gameboard.update(activePlayer, playerMove);
            activePlayer.incrementMoveCount();
            
            if (activePlayer.getMoveCount() >= Gameboard.getBoardSize()) {
                let hasWon = Gameboard.evaluateWin(activePlayer, playerMove);
    
                if (hasWon) {
                    console.log(`${activePlayer.getName()} wins!`);
                    endGame(activePlayer.getName());
                }
            }
    
            switchActivePlayer();
        }
    };

    pubsub.subscribe("cellClick", playRound);
    pubsub.subscribe("newGame", playGame);

    playGame();

    return { playGame, playRound };
    
    // helper functions

    function switchActivePlayer() {
        activePlayer = activePlayer === player1 ? player2 : player1;
    }
}();

function createPlayer (name, token) {
    let playerMoveCount = 0;
    const playerToken = (token === true ? 1 : -1);
    
    const getName = () => name;
    const getToken = () => playerToken;
    const getMoveCount = () => playerMoveCount;
    const incrementMoveCount = () => playerMoveCount++;

    return { getName, getToken, incrementMoveCount, getMoveCount };
}