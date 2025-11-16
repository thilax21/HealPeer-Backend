import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  likeBlog
} from "../controllers/blogController.js";
import multer from "multer";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Public – all approved blogs
router.get("/", getAllBlogs);

// Authenticated users
router.post("/", protect,upload.single("image"), createBlog);
router.get("/my-blogs", protect, getMyBlogs);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

// Admin – view all blogs
router.get("/admin/all", protect, getAllBlogsAdmin);

router.post("/:id/like", protect, likeBlog);
export default router;

