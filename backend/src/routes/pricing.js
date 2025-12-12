import express from "express";

const router = express.Router();

const BASE_PRICING = {
  schoolAdmin: 999,
  teacher: 499,
  student: 299
};

const FEATURE_PRICING = {
  analytics: 199,
  messaging: 149,
  storage: 99
};

const BUNDLE_DISCOUNTS = {
  "schoolAdmin+teacher+student": 0.2,
  "schoolAdmin+teacher": 0.15,
  "schoolAdmin+student": 0.1,
  "teacher+student": 0.1
};

router.post("/calculate", (req, res) => {
  const { portals = [], features = [] } = req.body;

  if (!Array.isArray(portals) || portals.length === 0) {
    return res.status(400).json({ message: "Select at least one portal" });
  }

  let base = 0;
  for (const p of portals) {
    base += BASE_PRICING[p] || 0;
  }

  let featuresCost = 0;
  for (const f of features) {
    featuresCost += FEATURE_PRICING[f] || 0;
  }

  const key = [...portals].sort().join("+");
  const discount = BUNDLE_DISCOUNTS[key] || 0;
  const subtotal = base + featuresCost;
  const discountAmount = subtotal * discount;
  const total = Math.round(subtotal - discountAmount);

  res.json({
    currency: "INR",
    base,
    featuresCost,
    discountRate: discount,
    discountAmount,
    total
  });
});

export default router;
