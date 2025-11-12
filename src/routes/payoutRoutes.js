// // import express from "express";
// // import { protect, adminOnly } from "../middlewares/authMiddleware.js";
// // import { getCounselorEarnings, payCounselor } from "../controllers/payoutController.js";

// // const router = express.Router();

// // // Admin – view unpaid counselor earnings
// // router.get("/earnings", protect, adminOnly, getCounselorEarnings);

// // // Admin – mark counselor as paid
// // router.post("/pay", protect, adminOnly, payCounselor);

// // export default router;
// import express from "express";
// import { protect, adminOnly } from "../middlewares/authMiddleware.js";
// import {
//   getCounselorEarnings,
//   payCounselor,
//   getPaymentHistory,
// } from "../controllers/payoutController.js";

// const router = express.Router();

// // Get all counselors earnings
// router.get("/earnings", protect, adminOnly, getCounselorEarnings);

// // Pay counselor
// router.post("/pay/:counselorId", protect, adminOnly, payCounselor);

// // Get all payment history
// router.get("/history", protect, adminOnly, getPaymentHistory);

// export default router;
// import express from "express";
// import { protect, adminOnly } from "../middlewares/authMiddleware.js";
// import {
//   getCounselorEarnings,
//   payCounselor,
//   getPaymentHistory,
// } from "../controllers/payoutController.js";

// const router = express.Router();

// // Admin – view unpaid counselor earnings
// router.get("/earnings", protect, adminOnly, getCounselorEarnings);

// // Admin – mark counselor as paid
// router.post("/pay/:counselorId", protect, adminOnly, payCounselor);

// // Admin – get payment history
// router.get("/history", protect, adminOnly, getPaymentHistory);

// export default router;
import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { createAdminCheckoutSession } from "../controllers/payoutController.js";

const router = express.Router();

// Admin creates Stripe checkout page for counselor payout
router.post("/admin-checkout-session", protect, adminOnly, createAdminCheckoutSession);

export default router;
