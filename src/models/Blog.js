// import mongoose from "mongoose";

// const blogSchema = new mongoose.Schema({
//   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   image: { type: String },
//   status: { type: String, enum: ["pending", "approved"], default: "approved" }, // Admin moderation option
// }, { timestamps: true });

// export default mongoose.model("Blog", blogSchema);
import mongoose from "mongoose";
const blogSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ likes
  status: { type: String, enum: ["pending", "approved"], default: "approved" },
}, { timestamps: true });
export default mongoose.model("Blog", blogSchema);