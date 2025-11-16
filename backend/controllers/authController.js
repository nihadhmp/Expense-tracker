import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Handle MongoDB connection errors specifically
    if (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message.includes("buffering timed out")
    ) {
      return res.status(500).json({
        error: "Database connection error",
        details:
          "Unable to connect to the database. Please try again later or contact support.",
      });
    }

    // Provide more detailed error information
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate field value entered",
        details: Object.keys(error.keyPattern),
      });
    }

    // For MongoDB connection errors
    if (error.name === "MongoError" || error.name === "MongoNetworkError") {
      return res.status(500).json({
        error: "Database connection error",
        details: "Unable to connect to the database. Please try again later.",
      });
    }

    res.status(500).json({
      error: "Server error during registration",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle MongoDB connection errors specifically
    if (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message.includes("buffering timed out")
    ) {
      return res.status(500).json({
        error: "Database connection error",
        details:
          "Unable to connect to the database. Please try again later or contact support.",
      });
    }

    // For MongoDB connection errors
    if (error.name === "MongoError" || error.name === "MongoNetworkError") {
      return res.status(500).json({
        error: "Database connection error",
        details: "Unable to connect to the database. Please try again later.",
      });
    }

    res.status(500).json({
      error: "Server error during login",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    // Handle MongoDB connection errors specifically
    if (
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message.includes("buffering timed out")
    ) {
      return res.status(500).json({
        error: "Database connection error",
        details:
          "Unable to connect to the database. Please try again later or contact support.",
      });
    }

    // For MongoDB connection errors
    if (error.name === "MongoError" || error.name === "MongoNetworkError") {
      return res.status(500).json({
        error: "Database connection error",
        details: "Unable to connect to the database. Please try again later.",
      });
    }

    res.status(500).json({
      error: "Server error",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
