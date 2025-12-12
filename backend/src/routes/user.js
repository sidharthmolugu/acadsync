import express from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const activeSubscriptions = (user.subscriptions || []).filter(
      (s) => s.status === "paid"
    );

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptions: activeSubscriptions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
