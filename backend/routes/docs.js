// backend/routes/docs.js
const express = require("express");
const router = express.Router();
const docsController = require("../controllers/docsController");

// GET /api/docs
router.get("/", docsController.listDocuments);

// GET /api/docs/:id
router.get("/:id", docsController.getDocument);

module.exports = router;
