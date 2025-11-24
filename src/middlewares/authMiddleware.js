// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   let token;
//   if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   }
//   if (!token) {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };
// // 🟢 Add this new middleware for admin-only access
// export const adminOnly = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied. Admins only." });
//   }
// };
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 Protect Route Middleware
export const protect = async (req, res, next) => {
  let token;

  // Check Bearer Token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User no longer exists" });
      }

      return next();

    } catch (error) {
      console.error("Auth Error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  // If no token at all
  return res.status(401).json({ message: "Not authorized, no token" });
};


// 🔐 Admin Only Middleware
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};
