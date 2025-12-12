import { useEffect, useState } from "react";
import api from "../api/client";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type Subscription = {
  portals: string[];
  features: string[];
  amount: number;
  status: string;
  validTill?: string;
  createdAt: string;
};

type UserWithSubscriptions = User & {
  subscriptions: Subscription[];
};

type Payment = {
  userName: string;
  email: string;
  amount: number;
  status: string;
  portals: string[];
  features: string[];
  createdAt: string;
};

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersWithSubs, setUsersWithSubs] = useState<UserWithSubscriptions[]>(
    []
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "users" | "payments" | "subscriptions"
  >("users");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    successfulPayments: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchPayments = async () => {
      try {
        const res = await api.get<Payment[]>("/admin/payments");
        setPayments(res.data);

        // Calculate stats
        const totalRevenue = res.data
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + p.amount, 0);
        const successfulPayments = res.data.filter(
          (p) => p.status === "paid"
        ).length;

        setStats((prev) => ({
          ...prev,
          totalRevenue,
          successfulPayments,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPayments(false);
      }
    };

    const fetchUsersWithSubs = async () => {
      try {
        const res = await api.get<UserWithSubscriptions[]>(
          "/admin/users-with-subscriptions"
        );
        setUsersWithSubs(res.data);

        const activeCount = res.data.reduce(
          (sum, u) =>
            sum + u.subscriptions.filter((s) => s.status === "paid").length,
          0
        );

        setStats((prev) => ({
          ...prev,
          totalUsers: res.data.length,
          activeSubscriptions: activeCount,
        }));
      } catch (err) {
        console.error(err);
        // Fallback: use payment data to show stats
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
        }));
      }
    };

    fetchUsers();
    fetchPayments();
    fetchUsersWithSubs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10b981";
      case "failed":
        return "#ef4444";
      default:
        return "#f59e0b";
    }
  };

  return (
    <div className="admin">
      <section className="card">
        <h1>Admin Portal</h1>
        <p className="muted">
          Manage users, payments, and track subscriptions across the platform.
        </p>
      </section>

      {/* Statistics Dashboard */}
      <section className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <p className="stat-value">{stats.activeSubscriptions}</p>
        </div>
        <div className="stat-card">
          <h3>Successful Payments</h3>
          <p className="stat-value">{stats.successfulPayments}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="card" style={{ marginTop: "2rem" }}>
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payments ({payments.length})
          </button>
          <button
            className={`tab-btn ${
              activeTab === "subscriptions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Subscriptions ({stats.activeSubscriptions})
          </button>
        </div>
      </section>

      {/* Users Tab */}
      {activeTab === "users" && (
        <section className="card">
          <h2>Registered Users</h2>
          {loadingUsers && <p>Loading users...</p>}
          {!loadingUsers && users.length === 0 && (
            <p className="muted">No users registered yet.</p>
          )}
          {!loadingUsers && users.length > 0 && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          style={{
                            padding: "0.3rem 0.6rem",
                            borderRadius: "0.4rem",
                            background:
                              u.role === "admin"
                                ? "rgba(255, 107, 53, 0.2)"
                                : "rgba(0, 78, 137, 0.2)",
                            color: u.role === "admin" ? "#ff6b35" : "#004e89",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <section className="card">
          <h2>Payment History</h2>
          {loadingPayments && <p>Loading payments...</p>}
          {!loadingPayments && payments.length === 0 && (
            <p className="muted">No payments recorded yet.</p>
          )}
          {!loadingPayments && payments.length > 0 && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Portals</th>
                    <th>Features</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.userName}</td>
                      <td>{p.email}</td>
                      <td>
                        <span style={{ fontSize: "0.9rem" }}>
                          {p.portals
                            .map((portal) => {
                              const portalNames: { [key: string]: string } = {
                                schoolAdmin: "School Admin",
                                teacher: "Teacher",
                                student: "Student",
                              };
                              return portalNames[portal] || portal;
                            })
                            .join(", ")}
                        </span>
                      </td>
                      <td>
                        {p.features.length > 0 ? p.features.join(", ") : "—"}
                      </td>
                      <td
                        style={{ fontWeight: "600", color: "var(--primary)" }}
                      >
                        ₹{p.amount}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.3rem 0.6rem",
                            borderRadius: "0.4rem",
                            background:
                              p.status === "paid"
                                ? "rgba(16, 185, 129, 0.2)"
                                : "rgba(239, 68, 68, 0.2)",
                            color: getStatusColor(p.status),
                            fontSize: "0.85rem",
                            fontWeight: "600",
                          }}
                        >
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <section className="card">
          <h2>Active Subscriptions</h2>
          {loadingUsers && <p>Loading subscriptions...</p>}
          {!loadingUsers && usersWithSubs.length === 0 && (
            <p className="muted">No subscriptions found.</p>
          )}
          {!loadingUsers && usersWithSubs.length > 0 && (
            <div className="subscriptions-grid">
              {usersWithSubs.map((user) =>
                user.subscriptions
                  .filter((sub) => sub.status === "paid")
                  .map((sub, subIdx) => (
                    <div
                      key={`${user._id}-${subIdx}`}
                      className="subscription-card"
                    >
                      <div style={{ marginBottom: "0.5rem" }}>
                        <p>
                          <strong>User:</strong> {user.name}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#666" }}>
                          {user.email}
                        </p>
                      </div>
                      <div
                        style={{
                          borderTop: "1px solid rgba(255, 107, 53, 0.2)",
                          paddingTop: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        <p>
                          <strong>Portals:</strong>{" "}
                          {sub.portals
                            .map((p) => {
                              const portalNames: { [key: string]: string } = {
                                schoolAdmin: "School Admin",
                                teacher: "Teacher",
                                student: "Student",
                              };
                              return portalNames[p] || p;
                            })
                            .join(", ")}
                        </p>
                        <p>
                          <strong>Features:</strong>{" "}
                          {sub.features.length > 0
                            ? sub.features.join(", ")
                            : "None"}
                        </p>
                        <p>
                          <strong>Amount:</strong> ₹{sub.amount}
                        </p>
                        {sub.validTill && (
                          <p>
                            <strong>Valid till:</strong>{" "}
                            {new Date(sub.validTill).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Admin;
