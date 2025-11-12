// backend: routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import path from "path";

const router = express.Router();

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Upload route
router.post("/", protect, upload.single("file"), (req, res) => {
  res.status(200).json({
    success: true,
    url: `/uploads/${req.file.filename}`,
  });
});

export default router;
