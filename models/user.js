const mongoose = require("mongoose");
const { Schema } = mongoose;
const gravatar = require("gravatar");

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
  },
});

userSchema.pre("save", function (next) {
  if (!this.avatarURL) {
    this.avatarURL = gravatar.url(this.email, { s: "200", r: "pg", d: "mm" });
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
