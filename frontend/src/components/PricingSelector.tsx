import React, { useEffect, useState } from "react";
import api from "../api/client";

const PORTALS = [
  { id: "schoolAdmin", label: "School Admin Portal" },
  { id: "teacher", label: "Teacher Portal" },
  { id: "student", label: "Student Portal" },
];

const FEATURES = [
  { id: "analytics", label: "Advanced Analytics" },
  { id: "messaging", label: "In-app Messaging" },
  { id: "storage", label: "Extra Storage" },
];

type PricingResponse = {
  currency: string;
  base: number;
  featuresCost: number;
  discountRate: number;
  discountAmount: number;
  total: number;
};

type Props = {
  onPriceChange: (
    price: PricingResponse | null,
    selection: { portals: string[]; features: string[] }
  ) => void;
};

const PricingSelector: React.FC<Props> = ({ onPriceChange }) => {
  const [portals, setPortals] = useState<string[]>(["schoolAdmin"]);
  const [features, setFeatures] = useState<string[]>([]);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const togglePortal = (id: string) => {
    setPortals((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchPricing = async () => {
      if (portals.length === 0) {
        setPricing(null);
        onPriceChange(null, { portals, features });
        return;
      }

      setLoading(true);
      try {
        const res = await api.post<PricingResponse>("/pricing/calculate", {
          portals,
          features,
        });

        setPricing(res.data);
        onPriceChange(res.data, { portals, features });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [portals, features]); // ✅ FIXED: removed onPriceChange

  return (
    <div className="card">
      <h2>Select Portals</h2>
      <div className="grid-3">
        {PORTALS.map((p) => (
          <button
            key={p.id}
            className={
              "chip " + (portals.includes(p.id) ? "chip-selected" : "")
            }
            onClick={() => togglePortal(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <h3 style={{ marginTop: "1.5rem" }}>Add Features</h3>
      <div className="grid-3">
        {FEATURES.map((f) => (
          <button
            key={f.id}
            className={
              "chip " + (features.includes(f.id) ? "chip-selected" : "")
            }
            onClick={() => toggleFeature(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="pricing-summary">
        {loading && <p>Updating price...</p>}

        {!loading && pricing && (
          <>
            <p>
              Base: ₹{pricing.base} | Features: ₹{pricing.featuresCost}
            </p>

            {pricing.discountRate > 0 && (
              <p>Bundle discount: {Math.round(pricing.discountRate * 100)}%</p>
            )}

            <h2>
              Total: ₹{pricing.total} {pricing.currency}
            </h2>
          </>
        )}

        {!loading && !pricing && (
          <p className="muted">Select at least one portal to see pricing.</p>
        )}
      </div>
    </div>
  );
};

export default PricingSelector;
