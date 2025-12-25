// src/models/CounselorAvailability.js
import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    min: 0,
    max: 6,
    required: true,
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
  durationMin: { type: Number, default: 60 },  // length of each session in minutes
});

const counselorAvailabilitySchema = new mongoose.Schema({
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one doc per counselor
  },
  slots: [timeSlotSchema],
});

const CounselorAvailability = mongoose.model(
  "CounselorAvailability",
  counselorAvailabilitySchema
);

export default CounselorAvailability;