// import Stripe from "stripe";
// import dotenv from "dotenv";
// dotenv.config();

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
// export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;


// src/lib/stripe.js
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.STRIPE_SECRET) {
  console.warn("Warning: STRIPE_SECRET not set in .env");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: "2024-06-20" });
