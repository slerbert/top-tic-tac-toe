const Gameboard = function(boardSize = 3) {
    let board = [];
    let primaryDiagonal = [];
    let secondaryDiagonal = [];

    init(boardSize);
    
    function init(boardSize = 3) {        
        // Initialize board and record diagonal indices
        for (let i = 0; i < boardSize; i++) {
            board[i] = [];
            primaryDiagonal.push([i, i]);
            secondaryDiagonal.push([i, boardSize - i - 1]);
    
            for (let j = 0; j < boardSize; j++) {
                board[i].push(0);
            }
        }
        pubsub.publish("boardChanged", board);
    }

    function evaluateWin(player, [row, col]) {
        // If player's token == 1, they'll win when any of the below return 3
        // If player's token == -1, they'll win if any return -3
        const winCondition = player.getToken() * 3;
        
        const colSum = getTokenSum(col);
        const rowSum = getTokenSum(row);
        const primaryDiagSum = getTokenSum([row, col], primaryDiagonal);
        const secondaryDiagSum = getTokenSum([row, col], secondaryDiagonal);
        
        return rowSum === winCondition || colSum === winCondition || primaryDiagSum === winCondition || secondaryDiagSum === winCondition;        
    }

    function containsSubArray(array, subarray) {
        return array.some(a => subarray.every((v, i) => v === a[i]));
    }

    function getTokenSum(index, diagonal = null) {
        if (typeof index === 'object' && diagonal) {
            let diagonalSum = 0;
            if (containsSubArray(diagonal, index)) {
                diagonalSum = diagonal.reduce(
                    (prev, current) => prev + board[current[0]][current[1]], 0
                );
            }
            return diagonalSum;
        } 

        // Row or col token sum 
        return board[index].reduce((a, b) => a + b, 0);
    }

    function getBoard() {
        return board;
    }

    function getBoardSize() {
        return boardSize;
    }

    function render() {
        console.table(board);
    }

    function reset(boardSize = 3) {
        board = [];
        primaryDiagonal = [];
        secondaryDiagonal = [];
        init(boardSize);
    }

    function setBoardSize(size) {
        if (size > 1 && size <= 9) {
            boardSize = size;
        }
    }
    
    function update(player, [row, col]) {
        board[row][col] = player.getToken();
        render();
        pubsub.publish("boardChanged", [row, col]);
    }

    function validateMove([row, col]) {
        return board[row][col] === 0;
    }
    
    return { init, evaluateWin, getBoard, getBoardSize, update, validateMove };
}();

const GameController = function() {
    let player1, player2, activePlayer;
    let isPlayable = false; // will be used to control event listeners

    const playGame = function() {
        isPlayable = true;
        const randomToken = Math.random() >= 0.5;
        player1 = createPlayer("Player A", randomToken);
        player2 = createPlayer("Player B", !randomToken);
        activePlayer = player1;
    };

    const playRound = function(indices = null) {       
        // Get user input and validate input (input will be saved as array [row, col])
            // indices variable only necessary for testing purposes
        let playerMove;
        if (indices) {
            playerMove = indices;
        } else {
            playerMove = getUserInput();            
        }

        let isValidMove = Gameboard.validateMove(playerMove);

        while(!isValidMove){
            // Only necessary for console version
                // In web version, just do nothing if not valid, but keep listening for valid input
            playerMove = getUserInput();
            isValidMove = Gameboard.validateMove(playerMove);
        }

        Gameboard.update(activePlayer, playerMove);
        activePlayer.incrementMoveCount();
        
        if (activePlayer.getMoveCount() >= Gameboard.getBoardSize()) {
            let hasWon = Gameboard.evaluateWin(activePlayer, playerMove);

            if (hasWon) {
                console.log(`${activePlayer.getName()} wins!`);
                endGame();
            }
        }

        switchActivePlayer();
    };

    return { playGame, playRound, testRounds };
    

    // helper functions
    function endGame() {
        isPlayable = false;
        Gameboard.reset();
    }

    function getUserInput() {
        // Only necessary for console version
        let userInput, playerMove;
        do {
            userInput = prompt(`Player ${activePlayer.getName()}'s turn: `);
            playerMove = userInput.split(' ').map(n => parseInt(n));
        } while (!validateUserInput(playerMove));

        return playerMove;
    }

    function switchActivePlayer() {
        activePlayer = activePlayer === player1 ? player2 : player1;
    }

    function validateUserInput(inputs) {
        // Only necessary for console version
        // Reduce array to a sum of bool, checking that each int is between 1 and 3
        const result = inputs.reduce(
            (previous, current) => previous + (current >= 0 && current < 3), 0
        );

        return result === 2;
    }

    function testRounds(nRoundsPerPlayer) {
        for (let i = 0; i < nRoundsPerPlayer; i++) {
            for (let j = 0; j < nRoundsPerPlayer; j++) {
                console.log(`Move: ${i} ${j}`)
                playRound([i, j]);
            }
        }
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