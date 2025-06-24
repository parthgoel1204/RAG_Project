require("dotenv").config();
require("./models/Document");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const path = require("path");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload()); 

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads")) 
);

const authController = require("./controllers/authController");
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);

const authMiddleware = require("./middlewares/authMiddleware");

const uploadRoutes = require("./routes/upload");
const searchRoutes = require("./routes/query");

app.use("/api/upload", authMiddleware, uploadRoutes);
app.use("/api/search", authMiddleware, searchRoutes);

const docsRoutes = require("./routes/docs");
app.use("/api/docs", authMiddleware, docsRoutes);

// ====== Health Check ======
app.get("/", (_req, res) => {
  res.send("RAG Backend is up and running");
});

