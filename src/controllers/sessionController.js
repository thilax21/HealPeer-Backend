// import Session from "../models/Session.js";
// import User from "../models/User.js";

// export const bookSession = async (req, res) => {
//   try {
//     const { counselorId, dateTime, amount } = req.body;

//     const counselor = await User.findById(counselorId);
//     if (!counselor) return res.status(404).json({ message: "Counselor not found" });

//     const session = await Session.create({
//       counselorId,
//       userId: req.user._id,
//       counselorName: counselor.name,
//       dateTime,
//       amount,
//       paymentStatus: "pending",
//     });

//     res.status(201).json({ success: true, data: session });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
import Session from "../models/Session.js"; 
import User from "../models/User.js";

// Book session (Client)
export const bookSession = async (req, res) => {
  try {
    const { counselorId, dateTime, amount } = req.body;

    const counselor = await User.findById(counselorId);
    if (!counselor) return res.status(404).json({ message: "Counselor not found" });

    const session = await Session.create({
      counselorId,
      userId: req.user._id,
      counselorName: counselor.name,
      dateTime,
      amount,
      paymentStatus: "pending",
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my sessions (Client/Counselor)
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ userId: req.user._id }, { counselorId: req.user._id }],
    }).populate("counselorId", "name email").populate("userId", "name email");

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all sessions
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("counselorId", "name email")
      .populate("userId", "name email");

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update session status (Admin/Counselor)
export const updateSessionStatus = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const { status } = req.body;
    session.status = status || session.status;
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

