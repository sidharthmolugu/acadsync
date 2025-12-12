import { useState } from "react";
import axios from "axios";
import PricingSelector from "../components/PricingSelector";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const [pricing, setPricing] = useState<any>(null); // store dynamic pricing
  const [loading, setLoading] = useState(false);

  const handlePriceChange = (price: any) => {
    setPricing(price);
  };

  const makePayment = async () => {
    if (!pricing) {
      alert("Select at least one portal/package first.");
      return;
    }

    try {
      setLoading(true);

      const amount = pricing.total; // dynamic amount from selector

      const { data } = await axios.post(
        "http://localhost:5000/api/payments/create-order",
        { amount }
      );

      const options = {
        key: "rzp_test_RqgryG480ZSpDY", // your Razorpay test key
        amount: data.order.amount,
        currency: "INR",
        name: "Acadsync SaaS",
        description: "Custom Subscription Checkout",
        order_id: data.order.id,
        redirect: false,

        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:5000/api/payments/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            alert(verifyRes.data.msg);
          } catch {
            alert("Verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="checkout-page"
      style={{ maxWidth: "600px", margin: "auto" }}
    >
      {/* PRICING SELECTOR */}
      <PricingSelector onPriceChange={(price) => handlePriceChange(price)} />

      {/* FINAL PRICE SUMMARY */}
      {pricing && (
        <div
          className="summary-box"
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: "10px",
            marginTop: "20px",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Final Price</h3>

          <p>
            Base: ₹{pricing.base} | Features: ₹{pricing.featuresCost}
          </p>

          {pricing.discountRate > 0 && (
            <p>Discount: {Math.round(pricing.discountRate * 100)}%</p>
          )}

          <h2 style={{ marginTop: "10px" }}>
            Total: ₹{pricing.total} {pricing.currency}
          </h2>
        </div>
      )}

      {/* CHECKOUT BUTTON */}
      <button
        disabled={!pricing || loading}
        onClick={makePayment}
        className="pay-btn"
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "14px",
          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        {loading ? "Processing..." : "Checkout with Razorpay"}
      </button>
    </div>
  );
};

export default Checkout;
