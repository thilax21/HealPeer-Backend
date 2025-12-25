
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js";

// import { stripeWebhook } from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js"
import counselorRoutes from "./routes/counselorRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js"
import availabilityRoutes from "./routes/availabilityRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import path from "path";
import chatRouter from "./routes/chat.js";
import bodyParser from "body-parser";
import ChatMessage from "./models/ChatMessage.js";
import payoutRoutes from "./routes/payoutRoutes.js"
import streamRoutes from "./routes/streamRoutes.js";

connectDB();

const app = express();

// Stripe webhook must be before express.json()
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
);




app.use(cors({
  origin:  "*",  // your frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


// app.options("*", cors());

app.use(express.json());




app.use("/api/auth", authRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/blogs", blogRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));


app.use("/api/chat", chatRouter);
app.use("/api/stream", streamRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/api/payout",payoutRoutes)
app.use("/api/booking",bookingRoutes)
app.use("/api/availability", availabilityRoutes);



// // Socket.io connection handling
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join_room", (room) => {
//     socket.join(room);
//     console.log(`User ${socket.id} joined room ${room}`);
//   });

//   socket.on("send_message", async (data) => {
//     const { room, senderId, message } = data;
    
//     // Save message to database
//     try {
//       const chatMessage = new ChatMessage({
//         room,
//         senderId,
//         message,
//         createdAt: new Date()
//       });
//       await chatMessage.save();
      
//       // Send message to room
//       io.to(room).emit("receive_message", {
//         senderId,
//         message,
//         createdAt: chatMessage.createdAt
//       });
//     } catch (error) {
//       console.error("Error saving message:", error);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });



// Test route
app.get("/", (req, res) => {
  res.send("HealPeer Backend Running");
});

const PORT = process.env.PORT ||  3000 ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
