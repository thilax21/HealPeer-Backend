import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getVideoToken } from "../controllers/videoController.js";

const router = express.Router();

router.get("/token", protect, getVideoToken);

export default router;
