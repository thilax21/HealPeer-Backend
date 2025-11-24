import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import { 
  getAllCounselors, 
  getUserProfile, 
  updateProfile, 
  getUserById 
} from "../controllers/userController.js";

const router = express.Router();
// Multer for profile image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
//   });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");   // <-- this folder MUST exist
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

  const upload = multer({ storage });

// Get own profile (client/counselor)
router.get("/profile", protect, getUserProfile);

// Update profile (client/counselor)
router.put("/update-profile/:id", protect, upload.single("profileImage"), updateProfile);

// Get all counselors (public)
router.get("/counselors", getAllCounselors);

// Get user by ID (optional, admin maybe)
router.get("/:id", protect, getUserById);

export default router;
