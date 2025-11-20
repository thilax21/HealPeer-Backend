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

// export const getAllCounselors = async (req, res) => {
//     try {
//       const counselors = await User.find({ role: "counselor" }).select(
//         "name email profileImage specialization"
//       );
//       res.json({ success: true, data: counselors });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   };
  
//   export const getUserProfile = async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id).select(
//         "name email profileImage specialization bio role"
//       );
//       if (!user) return res.status(404).json({ message: "User not found" });
//       res.json({ success: true, data: user });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   };


// Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile
// export const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const { name, bio, contactNumber } = req.body;
//     if (name) user.name = name;
//     if (bio) user.bio = bio;
//     if (contactNumber) user.contactNumber = contactNumber;
//     if (req.file) user.profileImage = `/uploads/${req.file.filename}`;

//     await user.save();

//     res.json({ message: "Profile updated", data: user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// Get own profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only allow owner or admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, bio, contactNumber } = req.body;
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (contactNumber) user.contactNumber = contactNumber;

    // Profile image (if using multer)
    if (req.file) user.profileImage = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active counselors (public)
export const getAllCounselors = async (req, res) => {
  try {
    const counselors = await User.find({ role: "counselor", status: "active" }).select("-password");
    res.json(counselors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
