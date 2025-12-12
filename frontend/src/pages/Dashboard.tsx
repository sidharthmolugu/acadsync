import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import PricingSelector from "../components/PricingSelector";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Subscription = {
  portals: string[];
  features: string[];
  amount: number;
  status: string;
  validTill?: string;
  createdAt: string;
};

type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptions: Subscription[];
};

type PricingResponse = {
  currency: string;
  base: number;
  featuresCost: number;
  discountRate: number;
  discountAmount: number;
  total: number;
};

type CartItem = {
  portals: string[];
  features: string[];
  amount: number;
  currency: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<{
    portals: string[];
    features: string[];
  }>({
    portals: [],
    features: [],
  });
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<MeResponse>("/user/me");
        setMe(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handlePriceChange = (
    price: PricingResponse | null,
    sel: { portals: string[]; features: string[] }
  ) => {
    setPricing(price);
    setSelection(sel);
  };

  const addToCart = () => {
    if (!pricing || selection.portals.length === 0) return;

    const newItem: CartItem = {
      portals: selection.portals,
      features: selection.features,
      amount: pricing.total,
      currency: pricing.currency,
    };

    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`Added ${selection.portals.join(", ")} to cart!`);
    // Reset selection
    setSelection({ portals: [], features: [] });
    setPricing(null);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.amount, 0);
  };

  const startPayment = async () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add items to cart first.");
      return;
    }

    const totalAmount = getTotalCartPrice();
    setIsPaying(true);
    try {
      const res = await api.post("/payments/create-order", {
        amount: totalAmount,
        currency: "INR",
        items: cart,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_key",
        amount: res.data.amount,
        currency: res.data.currency,
        name: "Acadsync",
        description: "Portal subscription",
        order_id: res.data.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/payments/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: totalAmount,
              currency: "INR",
              items: cart,
            });
            const updated = await api.get<MeResponse>("/user/me");
            setMe(updated.data);
            alert("Payment successful!");
            setCart([]);
            localStorage.removeItem("cart");
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: me?.name,
          email: me?.email,
        },
        theme: {
          color: "#ff6b35",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to start payment");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="dashboard">
      <section className="card">
        <h1>Hello, {user?.name}</h1>
        <p className="muted">
          Choose the portals and features you want, and pay securely with
          Razorpay.
        </p>
      </section>

      <section>
        <PricingSelector onPriceChange={handlePriceChange} />
        <button
          className="btn-primary"
          style={{ marginTop: "1rem", marginRight: "0.5rem" }}
          disabled={!pricing || selection.portals.length === 0}
          onClick={addToCart}
        >
          Add to Cart
        </button>
        <button
          className="btn-primary"
          style={{ marginTop: "1rem" }}
          disabled={cart.length === 0 || isPaying}
          onClick={startPayment}
        >
          {isPaying ? "Processing..." : "Checkout with Razorpay"}
        </button>
      </section>

      {cart.length > 0 && (
        <section className="card" style={{ marginTop: "2rem" }}>
          <h2>Shopping Cart ({cart.length} items)</h2>
          <div className="cart-items">
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div>
                  <p>
                    <strong>Portals: </strong>
                    {item.portals.join(", ")}
                  </p>
                  <p>
                    <strong>Features: </strong>
                    {item.features.length ? item.features.join(", ") : "None"}
                  </p>
                  <p>
                    <strong>Price: </strong>₹{item.amount}
                  </p>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => removeFromCart(idx)}
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "2px solid var(--primary)",
            }}
          >
            <h3 style={{ color: "var(--primary)" }}>
              Total: ₹{getTotalCartPrice()}
            </h3>
          </div>
        </section>
      )}

      <section className="card" style={{ marginTop: "2rem" }}>
        <h2>Your Subscriptions</h2>
        {loading && <p>Loading...</p>}
        {!loading && (!me || me.subscriptions.length === 0) && (
          <p className="muted">No active subscriptions yet.</p>
        )}
        {!loading && me && me.subscriptions.length > 0 && (
          <div className="subscriptions">
            {me.subscriptions.map((s, idx) => (
              <div key={idx} className="subscription-card">
                <p>
                  <strong>Portals: </strong>
                  {s.portals.join(", ")}
                </p>
                <p>
                  <strong>Features: </strong>
                  {s.features.length ? s.features.join(", ") : "None"}
                </p>
                <p>
                  <strong>Amount: </strong>₹{s.amount}
                </p>
                <p>
                  <strong>Status: </strong>
                  {s.status}
                </p>
                {s.validTill && (
                  <p>
                    <strong>Valid till: </strong>
                    {new Date(s.validTill).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
