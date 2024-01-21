const express = require("express");
const router = express.Router();
const {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
} = require("../../controllers/contacts");

router.get("/", async (req, res, next) => {
  const contacts = await listContacts();
  res.json(contacts);
});

router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const contact = await getById(contactId);

  if (contact) {
    res.json(contact);
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    res
      .status(400)
      .json({ message: "missing required name, email, or phone field" });
  } else {
    const newContact = await addContact({ name, email, phone });
    res.status(201).json(newContact);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const result = await removeContact(contactId);

  if (result) {
    res.json({ message: "contact deleted" });
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const { name, email, phone } = req.body;

  if (!name && !email && !phone) {
    res.status(400).json({ message: "missing fields" });
  } else {
    const updatedContact = await updateContact(contactId, {
      name,
      email,
      phone,
    });

    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  }
});

module.exports = router;
