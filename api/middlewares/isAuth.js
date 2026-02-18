const jwt = require("jsonwebtoken");
require("dotenv").config();

const isAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ msg: "No token, authorization denied" });

    const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") return res.status(401).json({ msg: "Token expired" });
    return res.status(500).json({ msg: "Server error" });
  }
};

module.exports = isAuth;
