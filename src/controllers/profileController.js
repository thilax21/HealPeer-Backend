import User from "../models/User.js";

// Get my profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;

    // If user uploaded an image:
    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all active counselors (for navbar & booking)
export const getAllCounselors = async (req, res) => {
  try {
    const counselors = await User.find({ role: "counselor", status: "active" }).select("name email specialization profileImage bio");
    res.status(200).json({ success: true, data: counselors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get public profile by ID (for viewing others)
export const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
