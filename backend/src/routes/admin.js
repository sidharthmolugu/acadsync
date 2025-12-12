import express from "express";
import User from "../models/User.js";
import { auth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", auth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().select("-passwordHash").lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/payments", auth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find({ "subscriptions.0": { $exists: true } })
      .select("name email subscriptions")
      .lean();
    const payments = [];
    users.forEach((u) => {
      (u.subscriptions || []).forEach((s) => {
        payments.push({
          userName: u.name,
          email: u.email,
          ...s
        });
      });
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

export default router;
