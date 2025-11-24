import express from "express";
import { setAvailability, getAvailability, getFreeSlots } from "../controllers/availabilityController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/set", protect, setAvailability); // counselor sets
router.get("/:counselorId", getAvailability);
router.get("/slots/check", getFreeSlots);

export default router;
