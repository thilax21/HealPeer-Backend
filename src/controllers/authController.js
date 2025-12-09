import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};






export const signup = async (req, res) => {
  try {
    const { name, email, password, role, bio, specialization, experience, contactNumber } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const userData = {
      name,
      email,
      password,
      role,
      bio,
      specialization,
      experience,
      contactNumber,
      profileImage,
    };

    // If counselor → set pending status
    if (role === "counselor") {
      userData.status = "pending";
      userData.isApproved = false;
    }

    const user = await User.create(userData);

    // ============================
    // 📩 SEND EMAIL AFTER SIGNUP
    // ============================
    try {
      if (role === "counselor") {
        // Counselor email
        await sendEmail(
          email,
          "Counselor Registration Pending",
          `Hi ${name},\n\nThank you for signing up as a counselor on HealPeer.\nYour account is now pending admin approval.\nWe will notify you once you are approved.\n\nBest regards,\nHealPeer Team`
        );
      } else {
        // Normal client email
        await sendEmail(
          email,
          "Welcome to HealPeer",
          `Hi ${name},\n\nWelcome to HealPeer! Your account has been successfully created.\nYou can now book counseling sessions anytime.\n\nThank you,\nHealPeer Team`
        );
      }
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    res.status(201).json({
      message:
        role === "counselor"
          ? "Counselor registered! Pending admin approval. Email sent."
          : "User registered successfully. Email sent.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
      },
      token: generateToken(user),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


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
  