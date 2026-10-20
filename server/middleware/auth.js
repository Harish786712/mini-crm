const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Authentication required" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("_id name email");
    if (!user) return res.status(401).json({ message: "Authentication required" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Authentication required" });
  }
};
