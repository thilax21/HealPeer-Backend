import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Signup
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      message: "User created successfully",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
  
      // Send email
      await sendEmail(email, "HealPeer  OTP", `Your OTP is: ${otp}`);
  
      res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

  // Reset Password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (user.otp !== otp || user.otpExpiry < Date.now())
        return res.status(400).json({ message: "Invalid or expired OTP" });
  
      user.password = newPassword;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  