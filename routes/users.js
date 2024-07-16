const express = require("express");
const {
  signupUser,
  loginUser,
  getUsers,
} = require("../controllers/user-controller");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/signin", loginUser);
router.post("/", getUsers);

module.exports = router;
