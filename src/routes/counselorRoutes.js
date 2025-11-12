// import express from "express";
// import { getPendingCounselors, approveCounselor, rejectCounselor } from "../controllers/counselorController.js";
// import { protect } from "../middlewares/authMiddleware.js";
// import User from "../models/User.js";  // ✅ Correct import

// const router = express.Router();

// // Admin routes
// router.get("/requests", protect, getPendingCounselors);
// router.put("/approve/:id", protect, approveCounselor);
// router.put("/reject/:id", protect, rejectCounselor);

// // Public route to get all active counselors
// router.get("/all", async (req, res) => {
//   try {
//     const counselors = await User.find({ role: "counselor", status: "active" }).select("-password");
//     res.status(200).json({ success: true, data: counselors });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;

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
router.get("/requests", protect, adminOnly, getPendingCounselors);
router.put("/approve/:id", protect, adminOnly, approveCounselor);
router.put("/reject/:id", protect, adminOnly, rejectCounselor);


// Public route: list all active counselors
router.get("/all", getAllActiveCounselors);
router.get("/:id", getCounselorById);

export default router;
