const mongoose = require("mongoose");
const partieSchema = new mongoose.Schema({
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  games: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
    },
  ],
});

module.export = mongoose.model("Partie", partieSchema);
