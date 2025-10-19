const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createContent,
  getContents,
  getContentById,
  updateContent,
  deleteContent,
} = require("../controllers/contentController");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("file"), createContent);
router.get("/", getContents);
router.get("/:id", getContentById);
router.put("/:id", upload.single("file"), updateContent);
router.delete("/:id", deleteContent);

module.exports = router;
