

// // src/models/User.js
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const bookedSessionSub = new mongoose.Schema({
//   bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
//   date: String,      // "YYYY-MM-DD"
//   time: String,      // "HH:mm"
//   dateTime: Date,
//   duration: Number,
//   sessionType: { type: String, enum: ["chat","audio","video"], default: "chat" },
//   meetLink: String,
//   client: { _id: mongoose.Schema.Types.ObjectId, name: String, email: String },
// });

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     role: { type: String, enum: ["client", "counselor", "admin"], default: "client" },

//     isApproved: { type: Boolean, default: false },
//     isCounselorRequest: { type: Boolean, default: false },


//     status: { type: String, enum: ["pending", "active", "rejected"], default: "active" },

//     profileImage: { type: String },
//     bio: { type: String },
//     specialization: { type: String },
//     experience: { type: String },
//     contactNumber: { type: String },
//     pricePerSession: { type: Number, default: 1000 },
//     timezone: { type: String, default: "Asia/Colombo" },

//     // Optional cached summary for quick UI reads (keeps in sync on booking creation)
//     bookedSessions: [bookedSessionSub],

//     availableSlots: [Date],

//     otp: { type: String },
//     otpExpiry: { type: Date },
//   },
//   { timestamps: true }
// );

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.matchPassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// export default mongoose.model("User", userSchema);



// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, enum: ["client", "counselor", "admin"], default: "client" },

    isApproved: { type: Boolean, default: false },
    isCounselorRequest: { type: Boolean, default: false },


    status: { type: String, enum: ["pending", "active", "rejected"], default: "active" },

    profileImage: { type: String },
    bio: { type: String },
    specialization: { type: String },
    experience: { type: String },
    contactNumber: { type: String },
    pricePerSession: { type: Number, default: 1000 },
    timezone: { type: String, default: "Asia/Colombo" },

   

    availableSlots: [Date],

    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
