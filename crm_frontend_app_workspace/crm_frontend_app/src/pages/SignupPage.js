import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// PUBLIC_INTERFACE
/**
 * Signup/Registration form page. Integrates with AuthContext and backend API.
 */
export default function SignupPage() {
  const { signup, isAuthenticated, authError, loading } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setFormError("Invalid email address.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    await signup(form.username, form.email, form.password);
    // Only redirect if no error
    if (!authError) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <section style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Username
          <input
            name="username"
            autoFocus
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {formError && <div style={{ color: "crimson" }}>{formError}</div>}
        {authError && <div style={{ color: "crimson" }}>{authError}</div>}
        <div style={{ fontSize: 14, marginTop: 10 }}>
          Already have an account? <NavLink to="/login">Login</NavLink>
        </div>
      </form>
    </section>
  );
}
