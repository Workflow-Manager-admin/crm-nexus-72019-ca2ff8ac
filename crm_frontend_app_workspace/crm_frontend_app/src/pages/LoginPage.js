import React, { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// PUBLIC_INTERFACE
/**
 * Login form page, integrates with AuthContext and backend auth API.
 */
export default function LoginPage() {
  const { login, isAuthenticated, authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // After login, redirect to from location or dashboard
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password.trim()) {
      setFormError("Please enter both email and password.");
      return;
    }
    await login(email, password);
    // Only redirect if no error
    if (!authError) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  };

  return (
    <section style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Email
          <input
            type="email"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </label>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {formError && <div style={{ color: "crimson" }}>{formError}</div>}
        {authError && <div style={{ color: "crimson" }}>{authError}</div>}
        <div style={{ fontSize: 14, marginTop: 10 }}>
          No account? <NavLink to="/signup">Sign up</NavLink>
        </div>
      </form>
    </section>
  );
}
