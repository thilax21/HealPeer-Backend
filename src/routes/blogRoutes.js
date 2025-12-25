

import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  likeBlog,
  getBlogById
} from "../controllers/blogController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.get("/all", getAllBlogs);
router.get("/my-blogs", protect, getMyBlogs);
router.get("/admin/all", protect, getAllBlogsAdmin);

router.post("/", protect, upload.single("image"), createBlog);
router.post("/:id/like", protect, likeBlog);

router.put("/:id", protect, upload.single("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);

// 🚨 always keep this LAST
router.get("/:id", getBlogById);

export default router;