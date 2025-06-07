// backend/routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const { handleSearchQuery } = require("../controllers/queryController");

// GET /api/search?q=<some-text>
router.get("/", handleSearchQuery);

module.exports = router;
