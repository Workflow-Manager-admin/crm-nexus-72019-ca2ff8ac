import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

/**
 * InteractionLog — Modular component for listing interactions and logging new ones
 * Can be embedded in both InteractionsPage (global) and per-customer detail views.
 * Props:
 *   customerId (optional): if provided, shows only this customer's interactions and disables customerId dropdown in add form
 *   customerName (optional): display label for current customer
 */
export default function InteractionLog({ customerId = null, customerName = null }) {
  const { authFetch, user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [filter, setFilter] = useState({
    customerId: customerId || "",
    type: "",
    occurredAtFrom: "",
    occurredAtTo: "",
    userId: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStatus, setAddStatus] = useState({ loading: false, error: "", success: "" });
  const [customers, setCustomers] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";
  const INTERACTION_TYPE_OPTIONS = [
    { value: "call", label: "Call" },
    { value: "meeting", label: "Meeting" },
    { value: "email", label: "Email" },
    { value: "note", label: "Note" }
  ];

  // Optionally preload customers for add form dropdown if not fixed
  useEffect(() => {
    if (!customerId) {
      authFetch(`${API_BASE}/customers`)
        .then((res) => res.ok ? res.json() : [])
        .then(setCustomers)
        .catch(() => setCustomers([]));
    }
    // eslint-disable-next-line
  }, []);

  // Fetch interactions (with filtering)
  const loadInteractions = useCallback(async () => {
    setLoading(true);
    setApiError("");
    const query = [];
    if (filter.customerId) query.push(`customerId=${encodeURIComponent(filter.customerId)}`);
    if (filter.type) query.push(`type=${filter.type}`);
    if (filter.userId) query.push(`userId=${filter.userId}`);
    if (filter.occurredAtFrom) query.push(`occurredAtFrom=${encodeURIComponent(filter.occurredAtFrom)}`);
    if (filter.occurredAtTo) query.push(`occurredAtTo=${encodeURIComponent(filter.occurredAtTo)}`);
    const url = `${API_BASE}/interactions${query.length ? "?" + query.join("&") : ""}`;
    try {
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch interactions");
      const data = await res.json();
      setInteractions(data);
      setLoading(false);
    } catch (err) {
      setApiError(err.message || "API error");
      setLoading(false);
    }
  }, [authFetch, filter, API_BASE]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  // Add interaction handler
  const handleAddInteraction = async (values) => {
    setAddStatus({ loading: true, error: "", success: "" });
    try {
      const res = await authFetch(`${API_BASE}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log interaction");
      setAddStatus({ loading: false, error: "", success: "Interaction logged." });
      setShowAddModal(false);
      setTimeout(loadInteractions, 400);
    } catch (err) {
      setAddStatus({ loading: false, error: err.message || "Error adding interaction", success: "" });
    }
  };

  // Handlers for filters (dates in YYYY-MM-DD)
  function handleChangeFilter(e) {
    setFilter(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleApplyFilter(e) {
    e.preventDefault();
    loadInteractions();
  }
  function handleResetFilter() {
    setFilter({
      customerId: customerId || "",
      type: "",
      occurredAtFrom: "",
      occurredAtTo: "",
      userId: "",
    });
  }

  // UI
  return (
    <div>
      <header style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <h3 style={{ flex: 1, fontWeight: 600, margin: 0 }}>
          Activity Log {customerName && <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>for {customerName}</span>}
        </h3>
        <button
          style={primaryBtn}
          onClick={() => setShowAddModal(true)}
        >
          + Log Interaction
        </button>
      </header>
      <form onSubmit={handleApplyFilter} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        {!customerId && (
          <select name="customerId" value={filter.customerId} onChange={handleChangeFilter} style={{ minWidth: 110 }}>
            <option value="">All customers</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} (ID {c.id})</option>)}
          </select>
        )}
        <select name="type" value={filter.type} onChange={handleChangeFilter} style={{ minWidth: 90 }}>
          <option value="">All Types</option>
          {INTERACTION_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          name="occurredAtFrom"
          type="date"
          value={filter.occurredAtFrom}
          onChange={handleChangeFilter}
        />
        <input
          name="occurredAtTo"
          type="date"
          value={filter.occurredAtTo}
          onChange={handleChangeFilter}
        />
        <button type="submit" style={primaryBtnSmall}>Filter</button>
        <button type="button" style={secondaryBtnSmall} onClick={handleResetFilter}>Reset</button>
      </form>
      {loading ? (
        <div>Loading interactions...</div>
      ) : apiError ? (
        <div style={{ color: "crimson" }}>{apiError}</div>
      ) : (
        <InteractionTimeline interactions={interactions} />
      )}
      {/* Add Interaction Modal */}
      {showAddModal && (
        <AddInteractionModal
          customerId={customerId}
          customers={customers}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddInteraction}
          user={user}
          status={addStatus}
        />
      )}
    </div>
  );
}

/**
 * Modal dialog for logging new customer interaction
 */
function AddInteractionModal({ onClose, onSubmit, customerId, customers, user, status }) {
  const [form, setForm] = useState({
    customerId: customerId || "",
    type: "",
    summary: "",
    occurredAt: new Date().toISOString().slice(0, 16),
  });
  const [formError, setFormError] = useState("");
  useEffect(() => {
    setForm(f => ({
      ...f,
      customerId: customerId || "",
      occurredAt: new Date().toISOString().slice(0, 16)
    }));
  }, [customerId]);

  const INTERACTION_TYPE_OPTIONS = [
    { value: "call", label: "Call" },
    { value: "meeting", label: "Meeting" },
    { value: "email", label: "Email" },
    { value: "note", label: "Note" }
  ];

  // Validate required fields
  function validate() {
    if (!form.customerId || isNaN(Number(form.customerId))) return "Customer is required";
    if (!form.type) return "Interaction type is required";
    if (!form.occurredAt) return "Date/time is required";
    return "";
  }
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    const occurredAtIso = form.occurredAt.length <= 10
      ? new Date(form.occurredAt).toISOString()
      : new Date(form.occurredAt).toISOString();
    onSubmit({
      ...form,
      customerId: Number(form.customerId),
      occurredAt: occurredAtIso,
    });
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Log Interaction</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15, minWidth: 320 }}>
          {!customerId && (
            <label>
              Customer *
              <select
                name="customerId"
                required
                value={form.customerId}
                onChange={handleChange}
                autoFocus
              >
                <option value="">Select…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} (ID {c.id})</option>)}
              </select>
            </label>
          )}
          <label>
            Type *
            <select name="type" value={form.type} onChange={handleChange} required>
              <option value="">Select…</option>
              {INTERACTION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label>
            When *
            <input
              name="occurredAt"
              type="datetime-local"
              value={form.occurredAt}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Summary/Details
            <input
              name="summary"
              type="text"
              value={form.summary}
              onChange={handleChange}
              placeholder="E.g., Follow-up call, sent contract…"
            />
          </label>
          {formError && <div style={{ color: "crimson", fontSize: 15 }}>{formError}</div>}
          {status.error && <div style={{ color: "crimson", fontSize: 15 }}>{status.error}</div>}
          {status.success && <div style={{ color: "green", fontSize: 15 }}>{status.success}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} style={modalBtnSecondary}>Cancel</button>
            <button type="submit" style={modalBtnPrimary} disabled={status.loading}>
              {status.loading ? "Saving..." : "Log Interaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Timeline view of activity
 */
function InteractionTimeline({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return <div style={{ marginTop: 22, color: "var(--text-secondary)" }}>
      No interactions found.</div>;
  }
  return (
    <div style={{ marginTop: 15 }}>
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {interactions.map(item => (
          <li key={item.id} style={timelineItemStyle}>
            {/* Timeline dot/line */}
            <div style={{ ...timelineDot, background: getTypeColor(item.type) }} />
            <div style={{ marginLeft: 31 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {capitalize(item.type)}
                <span style={{ color: "#888", marginLeft: 10, fontWeight: 400, fontSize: 13 }}>
                  {formatDateTime(item.occurredAt)}
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 15 }}>
                {item.summary || <span style={{ color: "#aaa", fontSize: 14 }}>No details</span>}
              </div>
              <div style={{ marginTop: 2, fontSize: 13, color: "#7979aa" }}>
                {!!item.Customer && (
                  <span>
                    For: <b>{item.Customer.name || "#" + item.Customer.id}</b> —{" "}
                  </span>
                )}
                Logged by: <span style={{ color: "#515196" }}>{item.User?.username || item.User?.email || "user"}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Styling constants ---
const primaryBtn = {
  background: "var(--button-bg)",
  color: "var(--button-text)",
  border: "none",
  borderRadius: 5,
  padding: "7px 15px",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer"
};
const primaryBtnSmall = { ...primaryBtn, fontSize: 14, padding: "5px 10px" };
const secondaryBtnSmall = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border-color)",
  fontSize: 14,
  padding: "5px 10px",
  borderRadius: 4,
  cursor: "pointer"
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0, width: "100vw", height: "100vh",
  background: "rgba(0,0,0,0.16)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 99999,
};
const modalStyle = {
  background: "var(--bg-primary)",
  borderRadius: 10,
  padding: "28px 24px 18px 24px",
  minWidth: 330,
  maxWidth: 420,
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  border: "1px solid var(--border-color)",
};
const modalBtnPrimary = {
  background: "var(--button-bg)",
  color: "var(--button-text)",
  border: "none",
  borderRadius: 5,
  padding: "8px 16px",
  fontWeight: 600,
  letterSpacing: 0.5,
  cursor: "pointer",
};
const modalBtnSecondary = {
  background: "transparent",
  border: "1px solid var(--border-color)",
  borderRadius: 5,
  padding: "8px 16px",
  color: "var(--text-primary)",
  fontWeight: 500,
  cursor: "pointer",
};
const timelineItemStyle = {
  position: "relative",
  minHeight: 64,
  marginBottom: 11,
  paddingLeft: 11,
  borderLeft: "2px solid #e3e4ef"
};
const timelineDot = {
  position: "absolute",
  left: -5,
  top: 14,
  width: 17,
  height: 17,
  borderRadius: "50%",
  border: "2px solid #fff",
  background: "#aaa",
  boxShadow: "0 1px 4px rgba(70,86,127,.12)"
};
// Helper: style color per interaction type
function getTypeColor(type) {
  switch (type) {
    case "call": return "#1976D2";
    case "meeting": return "#ff9800";
    case "email": return "#007b83";
    case "note": return "#cccccc";
    default: return "#bdbdbd";
  }
}
function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}
function formatDateTime(dt) {
  if (!dt) return "?";
  try {
    let d = new Date(dt);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return dt; }
}
