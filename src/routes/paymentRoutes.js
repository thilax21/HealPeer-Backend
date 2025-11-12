// import express from "express";
// import { protect } from "../middlewares/authMiddleware.js";
// import { createPaymentIntent, confirmPayment } from "../controllers/paymentController.js";

// const router = express.Router();

// router.post("/create-intent", protect, createPaymentIntent);
// router.post("/confirm", protect, confirmPayment);

// export default router;
// import express from "express";
// import { protect } from "../middlewares/authMiddleware.js";
// import { createCheckoutSession, confirmPayment } from "../controllers/paymentController.js";



// const router = express.Router();

// router.post("/create-checkout-session", protect, createCheckoutSession);
// router.post("/confirm", protect, confirmPayment);

// export default router;
import express from "express";
import { createSessionPayment, createAdminPayout } from "../controllers/paymentController.js";

const router = express.Router();

// Client pays for a session
router.post("/session", createSessionPayment);

// Admin pays monthly earnings
router.post("/admin-payout", createAdminPayout);

export default router;
