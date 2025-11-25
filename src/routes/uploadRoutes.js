// // export default router;
// import express from "express";
// import multer from "multer";
// import { protect } from "../middlewares/authMiddleware.js";
// import {
//   createBlog
// } from "../controllers/blogController.js";
// const router = express.Router();

// // Storage setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// })

// const upload = multer({ storage });

// // Upload API
// router.post("/", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   return res.json({
//     message: "Upload successful",
//     filePath: `/uploads/${req.file.filename}`
//   });
// });
// // In routes
// router.post("/", protect, upload.single("image"), createBlog);
// export default router;


// import express from "express";
// import multer from "multer";
// import { protect } from "../middlewares/authMiddleware.js";
// import { createBlog } from "../controllers/blogController.js";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });

// const upload = multer({ storage });

// // FINAL FIXED ROUTE
// router.post("/", protect, upload.single("image"), createBlog);

// export default router;
// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";


// const router = express.Router();

// // Ensure uploads folder exists
// const uploadsDir = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
//   console.log("📁 uploads/ folder created");
// }

// // Multer Storage Setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadsDir),
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// // Allow only images
// const fileFilter = (req, file, cb) => {
//   if (!file.mimetype.startsWith("image/")) {
//     return cb(new Error("Only image files are allowed"), false);
//   }
//   cb(null, true);
// };

// const upload = multer({
//   storage,
//   fileFilter,
// });



// export default router;

import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images allowed!"), false);
  }
  cb(null, true);
};

export const uploadImage = multer({ storage, fileFilter });
