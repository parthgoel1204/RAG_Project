// backend/models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  originalFilename: { type: String, required: true },
  filepath: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  numPages: { type: Number, required: true },
  numChunks: { type: Number, required: true },
  // If you want to associate with a “user”, add:
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Document", DocumentSchema);
