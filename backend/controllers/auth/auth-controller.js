const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User  = require("../../models/User");
const dns = require('dns').promises;
const validator = require("validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// OTP Email Transporter (Using a separate email for OTPs)
const otpEmailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
      user: process.env.OTP_EMAIL_USER,
      pass: process.env.OTP_EMAIL_PASS
  }
});

// Generate OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Validate Email Function
const validateEmail = async (email) => {
  if (!validator.isEmail(email)) {
      return false;
  }

  const domain = email.split('@')[1];
  try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords && mxRecords.length > 0;
  } catch (error) {
      console.error("MX record check failed:", error);
      return false;
  }
};

// Register User
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  // Validate email
  const isEmailValid = await validateEmail(email);
  if (!isEmailValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format or domain!",
    });
  }

  try {
    const checkUserByEmail = await User.findOne({ email });
    if (checkUserByEmail) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the same email! Please try again",
      });
    }

    const checkUserByUserName = await User.findOne({ userName });
    if (checkUserByUserName) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the same username! Please try again",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 14);

    // Create a new user
    const newUser = new User({
      userName,
      email,
      password: hashPassword, // Ensure this is being saved
    });

    // Save the user to the database
    await newUser.save();

    res.status(200).json({
      success: true,
      isVerified: false,
      message: "Registration successful! Please verify your email with the OTP.",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== "string") {
      return res.status(400).json({
          success: false,
          message: "Invalid email format!",
      });
  }

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found! Please register first.",
          });
      }

      // Generate OTP
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Save OTP and expiry in the user document
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP via email using OTP Transporter
      const mailOptions = {
          from: `"Art Plus OTP" <${process.env.OTP_EMAIL_USER}>`,
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
      };

      await otpEmailTransporter.sendMail(mailOptions);

      res.status(200).json({
          success: true,
          message: "OTP sent to your email!",
      });
  } catch (error) {
      console.error("OTP Send Error:", error);
      res.status(500).json({
          success: false,
          message: "An error occurred while sending OTP.",
      });
  }
};


// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
      // Find the user by email
      const user = await User.findOne({ email }).select('+otp +otpExpiry');
      // If user is not found
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found!",
          });
      }

      // Debugging: Log received and stored OTP
      console.log("Received OTP:", otp);
      console.log("Stored OTP:", user.otp);

      // Check if OTP matches
      if (String(user.otp).trim() !== String(otp).trim()) {
          return res.status(400).json({
              success: false,
              message: "Invalid OTP! Please try again.",
          });
      }

      // Check if OTP is expired
      if (user.otpExpiry < Date.now()) {
          return res.status(400).json({
              success: false,
              message: "OTP has expired! Please request a new one.",
          });
      }

      // Mark user as verified
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      res.status(200).json({
          success: true,
          message: "OTP verified successfully! Registration complete.",
      });
  } catch (error) {
      console.error("OTP Verification Error:", error);
      res.status(500).json({
          success: false,
          message: "An error occurred during OTP verification.",
      });
  }
};


//Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate email
  const isEmailValid = await validateEmail(email);
  if (!isEmailValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid email!",
    });
  }

  try {
    // Find the user by email
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist! Please register first.",
      });
    }

    // Check if the user's account is verified
    if (!checkUser.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified! Please verify your email.",
      });
    }

    // Debugging: Log the provided and stored passwords
    console.log("Provided Password:", password);
    console.log("Stored Password:", checkUser.password);

    // Compare the provided password with the hashed password in the database
    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password! Please try again.",
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.CLIENT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Send the token and user details in the response
    res.status(200).json({
      success: true,
      token,
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });

    // Alternatively, use cookies for authentication
    // res.cookie("token", token, { httpOnly: true, secure: true }).json({
    //   success: true,
    //   message: "Logged in successfully",
    //   user: {
    //     email: checkUser.email,
    //     role: checkUser.role,
    //     id: checkUser._id,
    //     userName: checkUser.userName,
    //   },
    // });
  } catch (e) {
    console.error("Login Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

//Logout
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }).json({
    success: true,
    message: "Logged out successfully!",
  });
};

// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token)
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized user!",
//     });


const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });

  try {
    const decoded = jwt.verify(token,  process.env.CLIENT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

module.exports = { registerUser, sendOtp, verifyOtp, loginUser, logoutUser, authMiddleware };
