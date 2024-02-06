const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const contactsRouter = require("./routes/api/contacts");
const usersRouter = require("./routes/users");
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

const app = express();
const port = 3000;

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

const uploadAvatar = multer({ storage: avatarStorage });

app.use("/avatars", express.static("public/avatars"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
