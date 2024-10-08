const GameController = function() {
    let activePlayer, player1, player2;
    let nDraws = 0;

    const resetToInitialState = function() {
        const randomToken = Math.random() >= 0.5;
        player1 = createPlayer(randomToken);
        player2 = createPlayer(!randomToken);

        pubsub.publish("gameStart");

        playGame();
    };

    const playGame = function() {
        player1.resetMoveCount();
        player2.resetMoveCount()
        activePlayer = player1;
    };

    const endGame = function(condition, name, score) {
        pubsub.publish("gameEnd", { condition, name, score });
    }

    const playRound = function([row, col]) {       
        let playerMove = [row, col];
        let isValidMove = Gameboard.validateMove(playerMove);

        if (isValidMove) {
            Gameboard.update(activePlayer, playerMove);
            activePlayer.incrementMoveCount();
            
            if (activePlayer.getMoveCount() >= Gameboard.getBoardSize()) {
                let hasWon = Gameboard.evaluateWin(activePlayer, playerMove);
                let drawnGame = Gameboard.evaluateDraw();
    
                if (hasWon) {
                    activePlayer.incrementScore();
                    endGame("win", activePlayer.getName(), activePlayer.getScore());
                } else if(drawnGame) {
                    nDraws++;
                    endGame("draw", null, nDraws);
                }

            }
            switchActivePlayer();
        }
    };

    pubsub.subscribe("cellClick", playRound);
    pubsub.subscribe("newGame", playGame);
    pubsub.subscribe("resetGame", resetToInitialState);

    resetToInitialState();

    return { playGame, playRound };

    function switchActivePlayer() {
        activePlayer = activePlayer === player1 ? player2 : player1;
    }
}();