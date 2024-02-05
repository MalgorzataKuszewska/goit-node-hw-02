const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected endpoint.", user: req.user });
});

module.exports = router;
