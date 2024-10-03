const Gameboard = function() {
    const boardSize = 3;
    let board = [];
    const primaryDiagonal = [];
    const secondaryDiagonal = [];

    // Initialize board and record diagonal indices
    for (let i = 0; i < boardSize; i++) {
        board[i] = [];
        primaryDiagonal.push([i, i]);
        secondaryDiagonal.push([i, boardSize - i - 1]);

        for (let j = 0; j < boardSize; j++) {
            board[i].push(0);
        }
    }

    function clear() {
        
    }

    function evaluateWin(player, [row, col]) {
        // If player's token == 1, they'll win when any of the below return 3
        // If player's token == -1, they'll win if any return -3
        const winCondition = player.getToken() * 3;
        
        // Check current row
        const rowSum = board[row].reduce(
            (a, b) => a + b, 0
        );
        // Check current column
        const colSum = board[col].reduce(
            (a, b) => a + b, 0
        );
        
        // Check diagonals if move includes the diagonal indices
        let primaryDiagSum = 0;
        let secondaryDiagSum = 0;
        if (primaryDiagonal.includes([row, col])) {
            primaryDiagSum = primaryDiagonal.reduce(
                (prev, current) => prev + board[current[0]][current[1]], 0
            );
        }
        if (secondaryDiagonal.includes([row, col])) {
            secondaryDiagSum = secondaryDiagonal.reduce(
                (prev, current) => prev + board[current[0]][current[1]], 0
            );
        }
        
        return rowSum === winCondition || colSum === winCondition || primaryDiagSum === winCondition || secondaryDiagSum === winCondition;        
    }

    function getBoard() {
        return board;
    }

    function getBoardSize() {
        return boardSize;
    }

    function render() {
        console.log(board);
    }
    
    function update(player, [row, col]) {
        board[row][col] = player.getToken();
        render();
        // pubsub.publish("boardChanged", board);
    }

    function validateMove([row, col]) {
        return board[row][col] === 0;
    }
    
    return { clear, evaluateWin, getBoard, getBoardSize, update, validateMove, secondaryDiagonal, primaryDiagonal };
}();

const GameController = function() {
    // Initialise players
        // get random int to determine player token (x or o) and pass to player factory function
    const randomToken = Math.random() >= 0.5;
    const player1 = createPlayer("PlayerA", randomToken);
    const player2 = createPlayer("PlayerB", !randomToken);

    // Initialise board

    // Render board (log)

    let activePlayer = player1;

    const playRound = function() {       
        // Get user input and validate input (input will be saved as array [row, col])
        let playerMove = getUserInput();

        // Check if valid move
        let isValidMove = Gameboard.validateMove(playerMove);

        while(!isValidMove){
            // Only necessary for console version
                // In web version, just do nothing if not valid, but keep listening for valid input
            playerMove = getUserInput();
            isValidMove = Gameboard.validateMove(playerMove);
        }

        // Update board with user token and render board (log)
        Gameboard.update(activePlayer, playerMove);
        activePlayer.incrementMoveCount();
        
        if (activePlayer.getMoveCount() >= Gameboard.getBoardSize()) {
            // Check win conditions if enough moves have been made to win
            let hasWon = Gameboard.evaluateWin(activePlayer, playerMove);

            if (hasWon) {
                console.log("You win");
            }
        }

        // Switch player
        switchActivePlayer();
    };

    return { playRound };
    

    // helper functions
    function getUserInput() {
        // Only necessary for console version
        // Also assumes zero-based indexing
        do {
            userInput = prompt(`Player ${activePlayer.getName()}'s turn: `);
            // String to array
            playerMove = userInput.split(' ');
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