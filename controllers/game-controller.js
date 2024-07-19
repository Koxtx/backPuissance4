const Game = require("../models/game.schema");

const joinGame = async (req, res) => {
  try {
    let game = await Game.findOne({ status: "ongoing" });

    if (!game) {
      const player1Id = req.body.playerId;
      game = new Game({ player1Id });
    } else if (!game.player2Id) {
      game.player2Id = req.body.playerId;
    } else {
      return res.status(400).json({ error: "Game is full" });
    }

    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const makeMove = async (req, res) => {
  try {
    const { gameId, row, col, playerId } = req.body;
    const game = await Game.findById(gameId);

    if (!game) return res.status(404).json({ error: "Game not found" });

    if (game.board[row][col] === null && playerId === game.currentPlayer) {
      game.board[row][col] = game.currentPlayer;
      game.currentPlayer = game.currentPlayer === "R" ? "Y" : "R";

      const winner = calculateWinner(game.board);
      if (winner) {
        game.status = "finished";
        game.winner = winner;
      } else if (game.board.flat().every(Boolean)) {
        game.status = "finished";
        game.winner = "draw";
      }

      await game.save();
      res.json(game);
    } else {
      res.status(400).json({ error: "Invalid move" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGameStatus = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const calculateWinner = (board) => {
  const rows = board.length;
  const cols = board[0].length;

  const directions = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
  ];

  const checkDirection = (row, col, dir) => {
    const player = board[row][col];
    if (!player) return null;

    for (let i = 1; i < 4; i++) {
      const newRow = row + dir.x * i;
      const newCol = col + dir.y * i;
      if (
        newRow < 0 ||
        newRow >= rows ||
        newCol < 0 ||
        newCol >= cols ||
        board[newRow][newCol] !== player
      ) {
        return null;
      }
    }
    return player;
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (let dir of directions) {
        const winner = checkDirection(row, col, dir);
        if (winner) return winner;
      }
    }
  }

  return null;
};

module.exports = {
  joinGame,
  makeMove,
  getGameStatus,
};
