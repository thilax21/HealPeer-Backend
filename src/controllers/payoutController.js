// import User from "../models/User.js";
// import PaymentHistory from "../models/PaymentHistory.js";

// // 🧮 Get counselors earnings summary
// export const getCounselorEarnings = async (req, res) => {
//   try {
//     const counselors = await User.find({ role: "counselor" })
//       .select("name email sessionsCompleted totalEarnings");

//     res.json({
//       success: true,
//       counselors,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching counselor earnings" });
//   }
// };

// // 💸 Pay counselor for the month
// export const payCounselor = async (req, res) => {
//   const { counselorId } = req.params;
//   const { amount, month } = req.body;

//   try {
//     const counselor = await User.findById(counselorId);

//     if (!counselor || counselor.role !== "counselor") {
//       return res.status(404).json({ message: "Counselor not found" });
//     }

//     // Record payment
//     const payment = await PaymentHistory.create({
//       counselor: counselor._id,
//       amount,
//       month,
//       paidBy: req.user._id,
//       status: "Paid",
//     });

//     // Update counselor totalEarnings
//     counselor.totalEarnings = (counselor.totalEarnings || 0) + amount;
//     await counselor.save();

//     res.json({
//       success: true,
//       message: `Payment of $${amount} made to ${counselor.name} for ${month}`,
//       payment,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Payment failed" });
//   }
// };

// // 📜 View all payment history
// export const getPaymentHistory = async (req, res) => {
//   try {
//     const payments = await PaymentHistory.find()
//       .populate("counselor", "name email")
//       .populate("paidBy", "name email")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, payments });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching payment history" });
//   }
// };
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
//             unit_amount: amount * 100, // Stripe expects cents
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

//     res.status(200).json({
//       success: true,
//       url: checkoutSession.url, // 👈 frontend will redirect here
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 🧾 Confirm Payment
// export const confirmPayment = async (req, res) => {
//   try {
//     const { sessionId } = req.body;

//     const session = await Session.findById(sessionId);
//     if (!session) return res.status(404).json({ message: "Session not found" });

//     session.paymentStatus = "paid";
//     await session.save();

//     res.status(200).json({ success: true, message: "Payment confirmed", data: session });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
import Stripe from "stripe";
import Counselor from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createAdminCheckoutSession = async (req, res) => {
  try {
    const { counselorId, amount } = req.body;

    const counselor = await Counselor.findById(counselorId);
    if (!counselor || !counselor.stripeAccountId) {
      return res.status(400).json({ success: false, message: "Counselor Stripe account not connected" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Monthly Counselor Payout" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        transfer_data: {
          destination: counselor.stripeAccountId,
        },
      },
      success_url: `${process.env.FRONTEND_URL}/admin-payout-success`,
      cancel_url: `${process.env.FRONTEND_URL}/admin-payout-cancel`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
