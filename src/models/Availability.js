import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // "09:00"
  end: { type: String, required: true }    // "10:00"
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: { type: String, required: true }, // Monday ...
  slots: [slotSchema]
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  days: [daySchema]
}, { timestamps: true });

export default mongoose.model("Availability", availabilitySchema);
