const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

const files = new Map();

function generateCode() {
  let code;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (files.has(code));

  return code;
}

app.post("/send", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file selected"
    });
  }

  const code = generateCode();

  files.set(code, {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
    data: req.file.buffer,
    createdAt: Date.now()
  });

  res.json({
    code
  });
});

app.get("/receive/:code", (req, res) => {
  const code = req.params.code;
  const file = files.get(code);

  if (!file) {
    return res.status(404).json({
      message: "Invalid or expired code"
    });
  }

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(file.name)}"`
  );

  res.setHeader("Content-Type", file.type);

  res.send(file.data);

  files.delete(code);
});

setInterval(() => {
  const now = Date.now();

  for (const [code, file] of files) {
    if (now - file.createdAt > 10 * 60 * 1000) {
      files.delete(code);
    }
  }
}, 60 * 1000);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});