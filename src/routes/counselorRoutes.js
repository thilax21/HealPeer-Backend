
import express from "express";
import {
  getPendingCounselors,
  approveCounselor,
  rejectCounselor,
  getAllActiveCounselors,
  requestCounselor,
  getCounselorById,
} from "../controllers/counselorController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Counselor requests to become one
router.post("/request", protect, requestCounselor);

// Admin only: manage counselor requests
router.get("/pending", protect, adminOnly, getPendingCounselors);
router.put("/approve/:id", protect, adminOnly, approveCounselor);
router.put("/reject/:id", protect, adminOnly, rejectCounselor);

// Public routes
router.get("/all", getAllActiveCounselors);

// 🚨 Must always be LAST
router.get("/:id", getCounselorById);

export default router;