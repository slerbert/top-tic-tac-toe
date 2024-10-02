const Gameboard = function() {
    function init() {
        this.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    }
    function update(player, coords) {
        this.board[coords[0]][coords[1]] = player.getToken();
    }
    function clear() {

    }
}();

const GameController = function() {
    // Initialise players

        // get random int to determine player token (x or o) and pass to player factory function
            // let whatever = (Math.random() >= 0.5 ? true : false);

        const randomToken = Math.random() >= 0.5;
        const player1 = createPlayer("PlayerA", randomToken);
        const player2 = createPlayer("PlayerB", !randomToken);

    // Initialise board

    // Render board (log)

    // LOOP
        // Get user input
            // User enters coordinate (1-9)
                // Check if valid move
                    // Index array at provided coordinate-1 
                // Update board
                    // Set value of array item at index to player token

        // Render board (log)

        // Win logic

        // Switch player


}();

function createPlayer (name, token) {
    const name = name;
    const token = (token === true ? 'o' : 'x');
    
    const getName = () => name;
    const getToken = () => token;

    return { getName, getToken };
}