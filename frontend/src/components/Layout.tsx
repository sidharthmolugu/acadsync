import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Acadsync SaaS</div>
        <nav className="nav">
          {user && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === "admin" && <Link to="/admin">Admin</Link>}
              <button className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
};

export default Layout;
