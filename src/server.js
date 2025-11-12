import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";


import authRoutes from "./routes/authRoutes.js"
import counselorRoutes from "./routes/counselorRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:5176",  // your frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());



app.use("/api/auth", authRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("HealPeer Backend Running");
});


const PORT = process.env.PORT || 5011;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
