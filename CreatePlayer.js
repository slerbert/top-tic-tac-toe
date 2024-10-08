const createPlayer = function(token){
    let playerMoveCount = 0;
    const playerToken = (token === true ? 1 : -1);
    let playerScore = 0;

    const playerName = playerToken === 1 ? "Player O" : "Player X";

    const getName = () => playerName;
    const getScore = () => playerScore;
    const getToken = () => playerToken;
    const getMoveCount = () => playerMoveCount;
    const incrementMoveCount = () => playerMoveCount++;
    const incrementScore = () => playerScore++;
    const resetMoveCount = () => (playerMoveCount = 0);

    return { getName, getToken, incrementMoveCount, getMoveCount, getScore, incrementScore, resetMoveCount };
};