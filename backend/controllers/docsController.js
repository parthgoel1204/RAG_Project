// backend/controllers/docsController.js
const Document = require("../models/Document");

// GET /api/docs
exports.listDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const docs = await Document.find({ userId })
      .select("_id originalFilename uploadDate numPages numChunks")
      .sort({ uploadDate: -1 });

    return res.json(docs);
  } catch (err) {
    console.error("docsController.listDocuments error:", err);
    return res.status(500).json({ message: "Server error listing documents." });
  }
};

// GET /api/docs/:id
exports.getDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const doc = await Document.findOne({ _id: req.params.id, userId })
      .select("_id originalFilename filepath uploadDate numPages numChunks");

    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }
    return res.json(doc);
  } catch (err) {
    console.error("docsController.getDocument error:", err);
    return res.status(500).json({ message: "Server error fetching document." });
  }
};
