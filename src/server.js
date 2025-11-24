import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js";


import authRoutes from "./routes/authRoutes.js"
import counselorRoutes from "./routes/counselorRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js"
import availabilityRoutes from "./routes/availabilityRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import path from "path";

import bodyParser from "body-parser";


connectDB();

const app = express();
app.use(cors({
  origin:  "*",  // your frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

const webhookApp = express();
webhookApp.post("/webhook/stripe", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  // delegate to controller
  // We need to import controller function here
  const { stripeWebhook } = await import("./controllers/paymentController.js");
  // attach rawBody to req for signature verification
  req.rawBody = req.body;
  // call handler
  return stripeWebhook(req, res);
});

app.use("/api/payment", webhookApp);




app.use("/api/auth", authRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));



app.use("/api/payment", paymentRoutes);

app.use("/api/booking",bookingRoutes)
app.use("/api/availability", availabilityRoutes);



// Test route
app.get("/", (req, res) => {
  res.send("HealPeer Backend Running");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
