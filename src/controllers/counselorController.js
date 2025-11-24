
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// User requests counselor approval
export const requestCounselor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.status = "pending";
    user.isCounselorRequest = true; // NEW FIELD
    user.isApproved = false;

    await user.save();
    
  
    res.json({ success: true, message: "Counselor request sent to admin" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN — get pending counselors
export const getPendingCounselors = async (req, res) => {
  try {
    const pendingCounselors = await User.find({
      isCounselorRequest: true,
      status: "pending",
    }).select("-password");

    res.status(200).json({ success: true, data: pendingCounselors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN — Approve
export const approveCounselor = async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id);

    if (!counselor)
      return res.status(404).json({ success: false, message: "Counselor not found" });
    counselor.role = "counselor";  // set here only
     counselor.status = "active";
    counselor.isApproved = true;
    counselor.isCounselorRequest = false;

    await counselor.save();

    try {
      await sendEmail(
        counselor.email,
        "Counselor Approved",
        `Hi ${counselor.name},\n\nCongratulations! Your counselor account has been approved. You can now start conducting sessions.\n\nBest regards,\nHealPeer Team`
      );
    } catch (emailErr) {
      console.error("Failed to send approval email:", emailErr);
    }

    res.status(200).json({
      success: true,
      message: "Counselor approved successfully",
      data: counselor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN — Reject
export const rejectCounselor = async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id);

    if (!counselor)
      return res.status(404).json({ success: false, message: "Counselor not found" });
   
    counselor.role = "user"; // keep normal user
     counselor.status = "rejected";
    counselor.isApproved = false;
    counselor.isCounselorRequest = false;

    await counselor.save();

    try {
      await sendEmail(
        counselor.email,
        "Counselor Registration Rejected",
        `Hi ${counselor.name},\n\nWe’re sorry to inform you that your counselor registration has been rejected by the admin.\n\nThank you,\nHealPeer Team`
      );
    } catch (emailErr) {
      console.error("Failed to send rejection email:", emailErr);
    }

    res.status(200).json({
      success: true,
      message: "Counselor rejected successfully",
      data: counselor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLIC — All active counselors list
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

// Counselor by ID
export const getCounselorById = async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id);
    if (!counselor) return res.status(404).json({ message: "Counselor not found" });
    res.json({ data: counselor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

