import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  room: String,       // room ID: counselorId_clientId
  senderId: String,   // who sent the message
  message: String,    // the text
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatMessage", chatMessageSchema);
