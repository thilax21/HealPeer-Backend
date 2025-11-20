// export default router;
import express from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createBlog
} from "../controllers/blogController.js";
const router = express.Router();

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
})

const upload = multer({ storage });

// Upload API
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  return res.json({
    message: "Upload successful",
    filePath: `/uploads/${req.file.filename}`
  });
});
// In routes
router.post("/", protect, upload.single("image"), createBlog);
export default router;

