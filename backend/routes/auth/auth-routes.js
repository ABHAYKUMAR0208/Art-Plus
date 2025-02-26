const express = require("express");
const {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected Routes (Require Authentication)
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "User is authenticated",
    user,
  });
});

module.exports = router;
