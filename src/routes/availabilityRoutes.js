// src/routes/availabilityRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  upsertAvailability,
  getWeeklyAvailability,
  getAvailableSlotsForDate,
} from "../controllers/availabilityController.js";

const router = express.Router();

// Counselor sets/updates their own availability
router.put("/", protect, upsertAvailability);

// Get weekly availability config
router.get("/:counselorId", getWeeklyAvailability);

// Get free slots for specific date
router.get("/:counselorId/date/:date", getAvailableSlotsForDate);

export default router;