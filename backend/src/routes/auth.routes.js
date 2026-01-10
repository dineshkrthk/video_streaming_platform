import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
console.log("Auth routes loaded");

//Register 
router.post("/register", async (req, res) => {
  console.log("REGISTER HIT", req.body);
  const { name, email, password, role, tenantId } = req.body;

  const allowedTenants = ["org1", "org2", "org3"];

  if (!allowedTenants.includes(tenantId)) {
    return res.status(400).json({ msg: "Invalid tenant" });
  }

 //Only allow viewer/editor signup
  if (!["viewer", "editor"].includes(role)) {
    return res.status(400).json({ msg: "Invalid role" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ msg: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    tenantId
  });

  res.json({ message: "User registered successfully" });
});

// Login 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      tenantId: user.tenantId
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

export default router;
