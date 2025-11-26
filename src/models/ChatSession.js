import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  lastUsed: { type: Date, required: true },
  minutesUsed: { type: Number, default: 0 } // track time used today
});

export default mongoose.model("ChatSession", chatSessionSchema);
