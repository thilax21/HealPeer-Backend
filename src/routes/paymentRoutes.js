import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";
const router = express.Router();



router.post("/session", createCheckoutSession);



// Stripe webhook route: must receive raw body, so we'll mount specially in app.js

router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);


export default router;
