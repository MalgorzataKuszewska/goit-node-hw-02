const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decodedToken = jwt.verify(token, "your_secret_key");

    const userId = decodedToken.userId;

    const user = await User.findById(userId);

    if (user && user.token === token) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authenticateToken;
