import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { parse, registerSchema, loginSchema } from "../utils.js";
const safe = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const token = (u, remember) =>
  jwt.sign({ sub: u.id }, process.env.JWT_SECRET, {
    expiresIn: remember ? "7d" : "8h",
    algorithm: "HS256",
  });
export async function register(req, res) {
  const data = parse(registerSchema, req.body);
  if (await User.exists({ email: data.email }))
    return res
      .status(400)
      .json({ message: "An account with this email already exists." });
  const u = await User.create({
    ...data,
    password: await bcrypt.hash(data.password, 12),
  });
  res.status(201).json({ user: safe(u), token: token(u, false) });
}
export async function login(req, res) {
  const data = parse(loginSchema, req.body);
  const u = await User.findOne({ email: data.email }).select("+password");
  if (!u || !(await bcrypt.compare(data.password, u.password)))
    return res.status(401).json({ message: "Email or password is incorrect." });
  res.json({ user: safe(u), token: token(u, data.rememberMe) });
}
export async function me(req, res) {
  res.json({ user: safe(req.user) });
}
