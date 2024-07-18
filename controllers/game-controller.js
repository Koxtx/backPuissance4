const Game = require("../models/game.schema");
const { broadcastGameUpdate } = require("../socket/socket");

const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postGame = async (req, res) => {
  try {
    const { player1Id, player2Id } = req.body;
    const player1 = await User.findById(player1Id);
    const player2 = await User.findById(player2Id);

    if (!player1 || !player2) {
      return res.status(404).json({ error: "One or both players not found" });
    }

    const game = new Game({ player1Id, player2Id });
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateGame = async (req, res) => {
  try {
    const { column } = req.body;
    const game = await Game.findById(req.params.id);

    if (!game || game.status !== "ongoing") {
      return res.status(400).json({ error: "Invalid game state" });
    }

    const row = game.board.findIndex((row) => row[column] === null);
    if (row === -1) {
      return res.status(400).json({ error: "Column is full" });
    }

    game.board[row][column] = game.currentPlayer;

    const checkWinner = (board) => {
      const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ];

      const checkDirection = (row, col, dir) => {
        const player = board[row][col];
        if (!player) return null;

        for (let i = 1; i < 4; i++) {
          const newRow = row + dir[0] * i;
          const newCol = col + dir[1] * i;
          if (
            newRow < 0 ||
            newRow >= 6 ||
            newCol < 0 ||
            newCol >= 7 ||
            board[newRow][newCol] !== player
          ) {
            return null;
          }
        }
        return player;
      };

      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
          for (let dir of directions) {
            const winner = checkDirection(row, col, dir);
            if (winner) return winner;
          }
        }
      }

      return null;
    };

    const winner = checkWinner(game.board);
    if (winner) {
      game.status = "finished";
      game.winner = winner;
    } else if (game.board.flat().every((cell) => cell !== null)) {
      game.status = "finished";
      game.winner = "draw";
    } else {
      game.currentPlayer = game.currentPlayer === "R" ? "Y" : "R";
    }

    await game.save();
    res.json(game);

    broadcastGameUpdate(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { postGame, updateGame, getGame };
