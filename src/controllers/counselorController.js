// import User from "../models/User.js";

// // Counselor sends request
// export const requestCounselor = async (req, res) => {
//   try {
//     req.user.counselorRequest = "pending";
//     await req.user.save();
//     res.json({ success: true, message: "Request sent to admin" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // Get all pending counselor requests (admin only)
// export const getPendingCounselors = async (req, res) => {
//   try {
//     const pendingCounselors = await User.find({ role: "counselor", status: "pending" }).select("-password");
//     res.status(200).json({ success: true, data: pendingCounselors });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Approve counselor
// export const approveCounselor = async (req, res) => {
//   try {
//     const counselor = await User.findById(req.params.id);
//     if (!counselor) return res.status(404).json({ message: "Counselor not found" });

//     counselor.status = "active";
//     await counselor.save();

//     res.status(200).json({ success: true, message: "Counselor approved", data: counselor });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Reject counselor
// export const rejectCounselor = async (req, res) => {
//   try {
//     const counselor = await User.findById(req.params.id);
//     if (!counselor) return res.status(404).json({ message: "Counselor not found" });

//     counselor.status = "pending"; // or delete counselor if desired
//     await counselor.save();

//     res.status(200).json({ success: true, message: "Counselor rejected", data: counselor });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
import User from "../models/User.js";

// Counselor sends approval request
export const requestCounselor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.status = "pending";
    await user.save();

    res.json({ success: true, message: "Counselor request sent to admin" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all pending counselor requests (Admin only)
export const getPendingCounselors = async (req, res) => {
  try {
    const pendingCounselors = await User.find({
      role: "counselor",
      status: "pending",
    }).select("-password");
    res.status(200).json({ success: true, data: pendingCounselors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve counselor
export const approveCounselor = async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id);
    if (!counselor)
      return res.status(404).json({ success: false, message: "Counselor not found" });

    counselor.status = "active";
    await counselor.save();

    res.status(200).json({
      success: true,
      message: "Counselor approved successfully",
      data: counselor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject counselor
export const rejectCounselor = async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id);
    if (!counselor)
      return res.status(404).json({ success: false, message: "Counselor not found" });

    counselor.status = "rejected";
    await counselor.save();

    res.status(200).json({
      success: true,
      message: "Counselor rejected successfully",
      data: counselor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public route: list of all approved counselors
export const getAllActiveCounselors = async (req, res) => {
  try {
    const counselors = await User.find({
      role: "counselor",
      status: "active",
    }).select("-password");

    res.status(200).json({ success: true, data: counselors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all counselor by id
export const getCounselorById = async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id).select("-password");
    if (!counselor) return res.status(404).json({ success: false, message: "Counselor not found" });
    res.json({ success: true, data: counselor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};