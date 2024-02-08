const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const Joi = require("joi");
const User = require("../models/users");
const authenticateToken = require("../middleware/authenticateToken");
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const sendVerificationEmail = require("../utils/sendVerificationEmail");

router.post("/verify", async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await sendVerificationEmail(email, user.verificationToken);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/verify/:verificationToken", async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error during verification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const verificationToken = uuidv4();

    const msg = {
      to: req.body.email,
      from: process.env.EMAIL_SENDER,
      subject: "Email Verification",
      text: `Click the link below to verify your email: ${process.env.BASE_URL}/users/verify/${verificationToken}`,
      html: `<p>Click the link below to verify your email:</p><p><a href="${process.env.BASE_URL}/users/verify/${verificationToken}">Verify email</a></p>`,
    };

    await sgMail.send(msg);

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      verificationToken,
      verify: false,
    });

    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription || "starter",
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const authenticateJwt = expressJwt({
  secret: "your_secret_key",
  algorithms: ["HS256"],
});

router.get("/current", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription || "starter",
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription || "starter",
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription || "starter",
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
