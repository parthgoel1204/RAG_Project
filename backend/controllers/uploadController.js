const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const config = require("../config");
const Document = require("../models/Document");
const pdfParse = require("pdf-parse");

exports.handleFileUpload = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const userId = req.user.id;

    // Enforce 20-doc limit for this user
    const existingCount = await Document.countDocuments({ userId });
    if (existingCount >= 20) {
      return res.status(400).json({ message: "Upload limit exceeded: you may only upload up to 20 documents." });
    }

    // Check PDF page count
    const file = req.files.document;
    const parsed = await pdfParse(file.data);
    const pageCount = parsed.numpages;
    if (pageCount > 1000) {
      return res.status(400).json({ message: `Document has ${pageCount} pages, which exceeds the 1000-page limit.` });
    }

    // Save file to uploads/
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.name);
    await file.mv(filePath);

    // Invoke Python ingestion
    const pythonExe = process.env.PYTHON_PATH || "python3"; 
    const script = path.join(process.cwd(), "rag_engine", "document_ingestor.py");
    const pyProcess = spawn(pythonExe, ["-u", script, "--filepath", filePath], {
      cwd: process.cwd()
    });

    let stdoutData = "";
    let stderrData = "";

    pyProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
      console.log("[document_ingestor stdout]:", data.toString());
    });
    pyProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
      console.error("[document_ingestor stderr]:", data.toString());
    });

    pyProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("document_ingestor.py exited with code", code);
        return res.status(500).json({
          message: "Error processing document in Python pipeline.",
          error: stderrData
        });
      }

      // Count chunks
      const chunksDir = path.join(process.cwd(), "rag_engine", "data", "chunks");
      const allChunks = fs.readdirSync(chunksDir).filter((fname) => fname.endsWith(".txt"));
      const numChunks = allChunks.length;

      // Save metadata with userId
      const docRecord = new Document({
        originalFilename: file.name,
        filepath: `/uploads/${file.name}`,
        uploadDate: new Date(),
        numPages: pageCount,
        numChunks,
        userId
      });
      await docRecord.save();

      // Respond
      return res.json({
        message: "File uploaded, indexed, and metadata saved successfully.",
        documentId: docRecord._id,
        numPages: pageCount,
        numChunks
      });
    });
  } catch (err) {
    console.error("Error in handleFileUpload:", err);
    return res.status(500).json({ message: "Server error while uploading file." });
  }
};
