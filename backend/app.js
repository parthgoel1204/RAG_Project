require('dotenv').config();
require("./models/Document");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const path = require("path");
const config = require("./config");

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUpload()); // for handling multipart/form-data

// ====== Connect to MongoDB (optional) ======
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// ====== Static folder for uploads (optional) ======
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads")) // serve uploaded files
);

// Auth routes
const authController = require("./controllers/authController");
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

// Protected routes (require valid JWT)
const authMiddleware = require("./middlewares/authMiddleware");
// Upload & search controllers
const uploadRoutes = require("./routes/upload");
const searchRoutes = require("./routes/query");

// All /api/upload/* routes require auth
app.use("/api/upload", authMiddleware, uploadRoutes);
// /api/search can be public or protected; choose as needed:
app.use("/api/search", authMiddleware, searchRoutes);

// Document metadata routes (also protected)
const docsRoutes = require("./routes/docs");
app.use("/api/docs", authMiddleware, docsRoutes);

// ====== Health Check ======
app.get("/", (_req, res) => {
  res.send("RAG Backend is up and running");
});


