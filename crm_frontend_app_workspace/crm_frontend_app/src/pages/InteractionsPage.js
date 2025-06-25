import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

/**
 * InteractionsPage - Main UI for viewing and adding customer interactions (calls, meetings, emails, notes).
 * Accessible from the sidebar or as part of customer details.
 * - Lists interactions for a given customer (filterable)
 * - Allows adding new interaction (modal)
 * - Timeline or list view
 * - Responsive feedback and error handling
 */

// --- API Util ---
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Backend enum types as reference for form dropdown
const INTERACTION_TYPE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
];

// PUBLIC_INTERFACE
export default function InteractionsPage({ customerId = null, customerName = null }) {
  const { authFetch, user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [filter, setFilter] = useState({
    customerId: customerId || "", // filter interactions per customer
    type: "",
    occurredAtFrom: "",
    occurredAtTo: "",
    userId: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStatus, setAddStatus] = useState({ loading: false, error: "", success: "" });

  // Fetch interactions from backend with filters
  const loadInteractions = useCallback(async () => {
    setLoading(true);
    setApiError("");
    // Build query params
    const query = [];
    // Only filter if present
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
  }, [authFetch, filter]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  // Add interaction handler (modal/form)
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

  // -- Filter Handlers --
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

  // -- UI --
  return (
    <section>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <h2 style={{ flex: 1 }}>
          Interactions {customerName && <span style={{ fontSize: 16, color: "var(--text-secondary)" }}>(for {customerName})</span>}
        </h2>
        <button
          style={primaryBtn}
          onClick={() => setShowAddModal(true)}
        >
          + Log Interaction
        </button>
      </header>
      <form onSubmit={handleApplyFilter} style={{ display: "flex", gap: 13, alignItems: "center", flexWrap: "wrap", marginBottom: 15 }}>
        {!customerId && (
          <input
            name="customerId"
            type="number"
            value={filter.customerId}
            onChange={handleChangeFilter}
            placeholder="Customer ID"
            min="1"
            style={{ width: 90 }}
          />
        )}
        <select name="type" value={filter.type} onChange={handleChangeFilter} style={{ minWidth: 98 }}>
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
      {/* Error/Feedback */}
      {loading ? (
        <div>Loading interactions...</div>
      ) : apiError ? (
        <div style={{ color: "crimson" }}>{apiError}</div>
      ) : (
        <InteractionTimeline interactions={interactions} />
      )}
      {/* Add Modal */}
      {showAddModal && (
        <AddInteractionModal
          customerId={customerId}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddInteraction}
          user={user}
          status={addStatus}
        />
      )}
    </section>
  );
}

/**
 * AddInteractionModal - Modal dialog/form for logging a new interaction
 */
function AddInteractionModal({ onClose, onSubmit, customerId, user, status }) {
  const [form, setForm] = useState({
    customerId: customerId || "",
    type: "",
    summary: "",
    occurredAt: new Date().toISOString().slice(0, 16), // ISO local format
  });
  const [formError, setFormError] = useState("");
  useEffect(() => {
    setForm(f => ({
      ...f,
      customerId: customerId || "",
      occurredAt: new Date().toISOString().slice(0, 16),
    }));
  }, [customerId]);

  // Validate required fields by backend contract
  function validate() {
    if (!form.customerId || isNaN(Number(form.customerId))) return "Customer ID is required";
    if (!form.type) return "Interaction type is required";
    if (!form.occurredAt) return "Date and time is required";
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
    // Convert occurredAt to ISO string (with Z if necessary)
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 300 }}>
          {!customerId && (
            <label>
              Customer ID *
              <input
                name="customerId"
                type="number"
                min="1"
                value={form.customerId}
                required
                onChange={handleChange}
                autoFocus
              />
            </label>
          )}
          <label>
            Type *
            <select name="type" value={form.type} onChange={handleChange} required>
              <option value="">Select...</option>
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
 * InteractionTimeline - Timeline/list view of interactions (responsive).
 */
function InteractionTimeline({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return <div style={{ marginTop: 24, color: "var(--text-secondary)" }}>No interactions found.</div>;
  }
  return (
    <div style={{ marginTop: 18 }}>
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {interactions.map(item => (
          <li key={item.id} style={timelineItemStyle}>
            {/* Timeline dot and line */}
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
                    For: <b>{item.Customer.name || "#"+item.Customer.id}</b> &mdash;{" "}
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

// --- Styling ---
const primaryBtn = {
  background: "var(--button-bg)",
  color: "var(--button-text)",
  border: "none",
  borderRadius: 5,
  padding: "7px 16px",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer"
};
const primaryBtnSmall = { ...primaryBtn, fontSize: 14, padding: "5px 12px" };
const secondaryBtnSmall = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border-color)",
  fontSize: 14,
  padding: "5px 13px",
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
// Timeline styles
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
// Color for each interaction type
function getTypeColor(type) {
  switch (type) {
    case "call": return "#1976D2";
    case "meeting": return "#ff9800";
    case "email": return "#007b83";
    case "note": return "#cccccc";
    default: return "#bdbdbd";
  }
}
// Helper: Capitalize string
function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}
// Helper: Format ISO datetime string (UTC or local)
function formatDateTime(dt) {
  if (!dt) return "?";
  try {
    let d = new Date(dt);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return dt; }
}
