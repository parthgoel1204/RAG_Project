const { spawn } = require("child_process");
const path = require("path");
const config = require("../config");

exports.handleSearchQuery = async (req, res) => {
  const queryText = req.query.q;
  if (!queryText) {
    return res.status(400).json({ message: "Query parameter 'q' is required." });
  }

  const pythonExe = config.PYTHON_PATH;
  const script = path.join(process.cwd(), "rag_engine", "query_faiss.py");

  // Pass the ChatGroq API key from environment
  const apiKey = process.env.CHATGROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "ChatGroq API key not set." });
  }

  const indexPath = path.join(process.cwd(), "rag_engine", "data", "index.faiss");
  const pyProcess = spawn(
    pythonExe,
    [
      script,
      "--query", queryText,
      "--api_key", apiKey,
      "--index_path", indexPath
    ],
    { cwd: process.cwd() }
  );

  let stdoutData = "";
  let stderrData = "";

  pyProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });
  pyProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
    console.error("[query_faiss stderr]", data.toString());
  });

  pyProcess.on("close", (code) => {
    if (code !== 0) {
      console.error("query_faiss.py exited with code", code);
      return res.status(500).json({
        message: "Error running Python search.",
        error: stderrData
      });
    }

    try {
      const results = JSON.parse(stdoutData);
      return res.json(results);
    } catch (err) {
      console.error("Failed to parse JSON from query_faiss.py:", err);
      return res.status(500).json({
        message: "Invalid JSON output from search script.",
        raw: stdoutData
      });
    }
  });
};
