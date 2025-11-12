// controllers/userController.js
import User from "../models/User.js";

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
};

export const updateMe = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true }
  );
  res.json({ user });
};

export const getAllCounselors = async (req, res) => {
    try {
      const counselors = await User.find({ role: "counselor" }).select(
        "name email profileImage specialization"
      );
      res.json({ success: true, data: counselors });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  export const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select(
        "name email profileImage specialization bio role"
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };