const express = require("express");

const router = express.Router();

const uploadAvatar = require("../middleware/multerConfig");

router.post("/upload", uploadAvatar.single("avatar"), (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({ message: "File uploaded successfully", file: uploadedFile });
});

router.get("/", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.get("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.post("/", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
