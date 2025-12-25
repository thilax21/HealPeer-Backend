

// controllers/blogController.js
import fs from "fs";
import path from "path";
import Blog from "../models/Blog.js";

const makeImageUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content required" });
    }

    // filename can come from req.file or from attach middleware (req.body._uploadedImage)
    const filename = req.file?.filename || req.body?._uploadedImage || null;
    const image = filename;
    const imageUrl = filename ? makeImageUrl(req, filename) : null;

    const blog = await Blog.create({
      author: req.user._id,
      title,
      content,
      image,
      imageUrl,
      status: "approved",
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error("Blog creation error:", error);
    // give more helpful response for debugging
    res.status(500).json({ success: false, message: "Server error creating blog", error: error.message });
  }
};

// Get all approved blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" })
      .populate("author", "name role profileImage")
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const normalized = blogs.map(b => {
      const obj = b.toObject();
      obj.imageUrl = obj.image ? `${baseUrl}/uploads/${obj.image}` : obj.imageUrl || null;
      return obj;
    });

    res.status(200).json({ success: true, data: normalized });
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get blog by id
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "name role profileImage email");
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const obj = blog.toObject();
    obj.imageUrl = obj.image ? `${baseUrl}/uploads/${obj.image}` : obj.imageUrl || null;

    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    console.error("Get blog by id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    // determine new filename if uploaded
    const newFilename = req.file?.filename || req.body?._uploadedImage || null;

    // If new file uploaded -> remove old file
    if (newFilename && blog.image) {
      const oldPath = path.join(process.cwd(), "uploads", blog.image);
      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Failed to remove old blog image:", err.message);
      });
    }

    const image = newFilename ? newFilename : blog.image;
    const imageUrl = image ? makeImageUrl(req, image) : null;

    const updatedData = {
      title: req.body.title || blog.title,
      content: req.body.content || blog.content,
      image,
      imageUrl,
    };

    const updated = await Blog.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    if (blog.image) {
      const oldPath = path.join(process.cwd(), "uploads", blog.image);
      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Failed to remove blog image:", err.message);
      });
    }

    await blog.deleteOne();
    res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin list, like, getMyBlogs unchanged (keep your earlier code)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "name role email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error("GetAllBlogsAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user._id.toString();
    if (!blog.likes?.includes(userId)) {
      blog.likes = [...(blog.likes || []), userId];
      await blog.save();
    }

    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    console.error("Like blog error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// controllers/blogController.js
// Get blogs for logged-in user
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate("author", "name role profileImage")
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const normalized = blogs.map(b => {
      const obj = b.toObject();
      obj.imageUrl = obj.image ? `${baseUrl}/uploads/${obj.image}` : obj.imageUrl || null;
      return obj;
    });

    res.status(200).json({ success: true, data: normalized });
  } catch (err) {
    console.error("Get my blogs error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
