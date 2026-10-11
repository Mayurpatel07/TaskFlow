import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ message: "Please sign in to continue." });
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = await User.findById(payload.sub);
    if (!req.user)
      return res
        .status(401)
        .json({ message: "This account no longer exists." });
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "Your session expired. Please sign in again." });
  }
}
