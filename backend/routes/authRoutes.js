const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

// Signup route
router.post("/signup", signup);
// Login route
router.post("/login", login);

//middleware protected route example
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

module.exports = router;