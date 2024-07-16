const express = require("express");
const {
  postGame,
  updateGame,
  getGame,
} = require("../controllers/game-controller");

const router = express.Router();

router.get("/:id", getGame);
router.post("/", postGame);
router.put("/:id", updateGame);

module.exports = router;
