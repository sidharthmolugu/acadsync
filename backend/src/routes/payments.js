import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const router = express.Router();

// ✅ CORRECT Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // dynamic amount from frontend

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
    };

    // ❗ FIX: use razorpayInstance instead of instance
    const order = await razorpayInstance.orders.create(options);

    res.json({ order });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ msg: "Error creating order" });
  }
});

// ✅ VERIFY PAYMENT SIGNATURE
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ msg: "Payment verified successfully" });
    }

    return res.status(400).json({ msg: "Invalid signature!" });
  } catch (error) {
    console.log("VERIFY ERROR:", error);
    res.status(500).json({ msg: "Verification failed" });
  }
});

export default router;
