function getDiagonals(boardSize) {
    const primaryDiagonal = [];
    const secondaryDiagonal = [];
            // indices of diagonals can be determined algorithmically
        // for top-left diagonal, start at 1 (or 0) and add n+1 (n = nrows or ncols) n-1 times (i.e., 1, 5, 9)
        // for top-right diagonal, start at n and add n-1 until you have n indices (3, 5, 7)
    let primaryDiagStart = 0;
    let secondaryDiagStart = boardSize-1;
    for (let i = 0; i < boardSize; i++) {
        primaryDiagonal[i] = primaryDiagStart;
        primaryDiagStart += boardSize+1;

        secondaryDiagonal[i] = secondaryDiagStart;
        secondaryDiagStart += boardSize-1;
    }
    console.log(primaryDiagonal);
    console.log(secondaryDiagonal);
}

const Gameboard = function() {
    const boardSize = 3;
    let board = [];
    const primaryDiagonal = [];
    const secondaryDiagonal = [];
    const boardCenter = Math.floor(boardSize / 2);

    for (let i = 0; i < boardSize; i++) {
        board[i] = [];

        for (let j = 0; j < boardSize; j++) {
            board[i].push(0);

            // Save diagonal indices for later (this seems unnecessarily convoluted)
            if (i === boardCenter && j == boardCenter && (boardSize % 2) !== 0) {
                // Handles case where the middle cell is on both the primary and secondary diagonals
                primaryDiagonal.push([i, j]);
                secondaryDiagonal.push([i, j]);
            } else if ((i + j) === boardSize-1) {
                secondaryDiagonal.push([i, j]);
            } else if (i == j) {
                primaryDiagonal.push([i, j]);
            }
        }
    }

    function update(player, [row, col]) {
        board[row][col] = player.getToken();
        render();
        // pubsub.publish("boardChanged", board);
    }
    function clear() {

    }
    function getBoard() {
        return board;
    }
    function validateMove([row, col]) {
        return board[row][col] === 0;
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
    function render() {
        console.log(board);
    }

    return { update, clear, getBoard, validateMove , evaluateWin};
}();

const GameController = function() {
    // helper functions
    const getUserInput = function() {
        // Only necessary for console version
        // Also assumes zero-based indexing
        do {
            userInput = prompt(`Player ${activePlayer.getName()}'s turn: `);
            // String to array
            playerMove = userInput.split(' ');
        } while (!validateUserInput(playerMove));

        return playerMove;
    };

    const validateUserInput = function(inputs) {
        // Only necessary for console version
        // Reduce array to a sum of bool, checking that each int is between 1 and 3
        const result = inputs.reduce(
            (previous, current) => previous + (current >= 0 && current < 3), 0
        );

        return result === 2;
    };

    const switchActivePlayer = function() {
        activePlayer = activePlayer === player1 ? player2 : player1;
    };


    // Initialise players

        // get random int to determine player token (x or o) and pass to player factory function
            // let whatever = (Math.random() >= 0.5 ? true : false);

        const randomToken = Math.random() >= 0.5;
        const player1 = createPlayer("PlayerA", randomToken);
        const player2 = createPlayer("PlayerB", !randomToken);

    // Initialise board

    // Render board (log)

    let activePlayer = player1;

    const playRound = function() {
       
        // LOOP
        // Get user input
        let playerMove = getUserInput();

        // User enters row and col (1-3)
        // Check if valid move
        let isValidMove = Gameboard.validateMove(playerMove);

        while(!isValidMove){
            // Only necessary for console version
                // In web version, just do nothing if not valid, but keep listening for valid input
            playerMove = getUserInput();
            isValidMove = Gameboard.validateMove(playerMove);
        }

        // Index array at provided coordinate-1 
        // Set value of array item at index to player token
        // Update board
        // Render board (log)
        Gameboard.update(activePlayer, playerMove);
        
        // Win logic
        let hasWon = Gameboard.evaluateWin(activePlayer, playerMove);

        if (hasWon) {
            console.log("You win");
        }

        // Switch player
        switchActivePlayer();
    };

    return { playRound };

}();

function createPlayer (name, token) {
    const playerToken = (token === true ? 1 : -1);
    
    const getName = () => name;
    const getToken = () => playerToken;

    return { getName, getToken };
}