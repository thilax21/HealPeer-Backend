import express from "express";
import { generateStreamToken } from "../lib/stream.js";

const router = express.Router();

// GET /api/token/:userId
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing userId" });
  }

  try {
    const token = generateStreamToken(userId);
    return res.json({ success: true, token });
  } catch (err) {
    console.error("Token generation failed:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
