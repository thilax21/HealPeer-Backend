import express from "express";
import {
  getCounselorEarnings,
  processPayout,
  getPayoutHistory,
  getCounselorPayoutSummary,
  getAdminDashboardStats
} from "../controllers/payoutController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes - get all counselor earnings
router.get("/earnings", protect, adminOnly, getCounselorEarnings);

// Admin routes - process payout to counselor
router.post("/pay/:counselorId", protect, adminOnly, processPayout);

// Admin routes - get payout history
router.get("/history", protect, adminOnly, getPayoutHistory);

// Admin routes - get dashboard stats
router.get("/dashboard-stats", protect, adminOnly, getAdminDashboardStats);

// Counselor routes - get individual counselor payout summary
router.get("/summary/:counselorId", protect, getCounselorPayoutSummary);

export default router;
