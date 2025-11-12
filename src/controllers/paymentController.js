// import Stripe from "stripe";
// import Session from "../models/Session.js";

// import dotenv from "dotenv";

// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // 🧾 Create Stripe Checkout Session
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { sessionId, amount } = req.body;

//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({ message: "Session not found" });
//     }

//     const checkoutSession = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: `Counseling Session with ${session.counselorName}`,
//             },
//             unit_amount: amount * 100, // convert to cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?sessionId=${session._id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
//       metadata: {
//         sessionId: session._id.toString(),
//       },
//     });

//     // 👇 Send checkout page URL to frontend
//     res.status(200).json({
//       success: true,
//       url: checkoutSession.url,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Confirm Payment
// export const confirmPayment = async (req, res) => {
//   try {
//     const { sessionId } = req.body;

//     const session = await Session.findById(sessionId);
//     if (!session) return res.status(404).json({ message: "Session not found" });

//     session.paymentStatus = "paid";
//     await session.save();

//     res.status(200).json({
//       success: true,
//       message: "Payment confirmed",
//       data: session,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Client pays for a session
export const createSessionPayment = async (req, res) => {
  try {
    const { amount, currency, counselorName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: { name: `Session with ${counselorName}` },
            unit_amount: amount * 100, // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Admin pays total monthly earnings to a counselor
export const createAdminPayout = async (req, res) => {
  try {
    const { amount, currency, counselorName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: { name: `Monthly payout for ${counselorName}` },
            unit_amount: amount * 100, // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
