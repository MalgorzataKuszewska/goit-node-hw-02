const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const multer = require("multer");
const jimp = require("jimp");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.patch("/avatars", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const image = await jimp.read(req.file.buffer);
    await image.resize(250, 250);
    const uniqueFilename = `${user._id}-${Date.now()}${path.extname(
      req.file.originalname
    )}`;
    const avatarPath = path.join(
      __dirname,
      "../public/avatars",
      uniqueFilename
    );

    await image.writeAsync(avatarPath);

    const avatarURL = `/avatars/${uniqueFilename}`;
    user.avatarURL = avatarURL;
    await user.save();

    res.status(200).json({ avatarURL });
  } catch (error) {
    console.error("Error during avatar update:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

    const newUser = new User({
      email,
      password,
      avatarURL,
    });

    const saltRounds = 10;
    newUser.password = await bcrypt.hash(password, saltRounds);

    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription || "starter",
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
