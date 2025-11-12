import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "counselor", "admin"], default: "client" },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "active"], default: "active" }, // for counselor approval
  avatar: { type: String },

  // Profile info
  bio: { type: String },
  specialization: { type: String },     // For counselors
  experience: { type: String },
  profileImage: { type: String },
  contactNumber: { type: String },

  otp: { type: String },
otpExpiry: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
