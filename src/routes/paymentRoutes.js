// import express from "express";
// import { createCheckoutSession, stripeWebhook, getPaymentDetails } from "../controllers/paymentController.js";
// const router = express.Router();

// // Create checkout session
// router.post("/session", createCheckoutSession);

// // Get payment details by session ID
// router.get("/details/:sessionId", getPaymentDetails);



// export default router;


// import express from "express";
// import {
//   createCheckoutSession,
//   stripeWebhook,
//   // getPaymentDetails
// } from "../controllers/paymentController.js";

// const router = express.Router();

// // -----------------------
// // STRIPE WEBHOOK (RAW BODY)
// // -----------------------
// // router.post("/webhook", express.json(), stripeWebhook);
// router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);


// // -----------------------
// // NORMAL JSON ROUTES
// // -----------------------
// router.post("/create-checkout-session", createCheckoutSession);

// // router.get("/details/:sessionId", getPaymentDetails);

// export default router;

import express from "express";
import { stripeWebhook } from "../controllers/bookingController.js";

const router = express.Router();

// Stripe requires raw body for webhook
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
