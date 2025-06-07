// backend/routes/upload.js
const express = require("express");
const router = express.Router();
const { handleFileUpload } = require("../controllers/uploadController");

// POST /api/upload/file
router.post("/file", handleFileUpload);

module.exports = router;
