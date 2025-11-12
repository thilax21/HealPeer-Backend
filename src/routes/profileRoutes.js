import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMyProfile, updateMyProfile, getAllCounselors, getProfileById } from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateMyProfile);
router.get("/counselors", getAllCounselors);
router.get("/:id", getProfileById);

export default router;
