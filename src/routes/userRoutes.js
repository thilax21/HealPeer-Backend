import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMe, updateMe } from "../controllers/userController.js";
import { getAllCounselors, getUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
// All approved counselors
router.get("/counselors", getAllCounselors);

// Individual user profile
router.get("/:id", protect, getUserProfile);

export default router;
