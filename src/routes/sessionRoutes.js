import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { bookSession, getMySessions, getAllSessions, updateSessionStatus } from "../controllers/sessionController.js";

const router = express.Router();

// Book session (Client)
router.post("/book", protect, bookSession);

// Get my sessions (Client/Counselor)
router.get("/my-sessions", protect, getMySessions);

// Admin: Get all sessions
router.get("/all", protect, getAllSessions);

// Update session status (Admin/Counselor)
router.put("/update-status/:id", protect, updateSessionStatus);



export default router;
