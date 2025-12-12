import mongoose from "mongoose";

const portalTypes = ["schoolAdmin", "teacher", "student"];

const subscriptionSchema = new mongoose.Schema(
  {
    portals: {
      type: [String],
      enum: portalTypes,
      required: true
    },
    features: {
      type: [String],
      default: []
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    validTill: Date
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    subscriptions: [subscriptionSchema]
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
