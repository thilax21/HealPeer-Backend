
import express from "express";
import { signup, login, forgotPassword, resetPassword } from "../controllers/authController.js";
import multer from "multer";

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure uploads folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Signup route with optional profileImage upload
router.post("/signup", upload.single("profileImage"), signup);

// Login
router.post("/login", login);

// Forgot/Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
