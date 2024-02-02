const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect("mongodb://localhost:27017/contacts", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("Database connection error:", error.message);
  process.exit(1);
});

db.once("open", () => {
  console.log("Database connection successful");
});

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const contact = await Contact.findById(contactId);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  try {
    const newContact = await Contact.create({ name, email, phone });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const result = await Contact.findByIdAndDelete(contactId);
    if (result) {
      res.json({ message: "contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const { name, email, phone } = req.body;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { name, email, phone },
      { new: true }
    );
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  if (favorite === undefined) {
    res.status(400).json({ message: "missing field favorite" });
    return;
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );

    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
