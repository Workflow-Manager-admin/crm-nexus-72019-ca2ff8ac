import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

/*
 * Customer Management Page:
 * - List customers in a table, paginated
 * - Filter/search (by name, email, company)
 * - Create/edit customer forms as modal/dialog
 * - Delete functionality with confirmation
 * - Integrates to backend API with JWT
 */

// -- API Util (could move to separate file) --
const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

// Map backend customer fields
const CUSTOMER_FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "notes", label: "Notes" },
];

// Helper: get default filter fields
function getDefaultFilters() {
  return { name: "", email: "", company: "" };
}

// ---- Main CustomersPage ---- //

export default function CustomersPage() {
  const { authFetch } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [filter, setFilter] = useState(getDefaultFilters());
  const [searchInput, setSearchInput] = useState(getDefaultFilters());
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, total: 1, totalCount: 0 });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // or "edit"
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formStatus, setFormStatus] = useState({ loading: false, error: "", success: "" });
  const [showDelete, setShowDelete] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: "", success: "" });

  // Fetch all customers (no paging/filter on backend, so frontend handles it)
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await authFetch(`${API_BASE}/customers`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
      // Client-side filter+pagination
      let filtered = data;
      Object.entries(filter).forEach(([key, val]) => {
        if (val && val.trim())
          filtered = filtered.filter(c => (c[key] || "").toLowerCase().includes(val.toLowerCase()));
      });
      setPagination({
        page,
        totalCount: filtered.length,
        total: Math.max(1, Math.ceil(filtered.length / rowsPerPage)),
      });
      setLoading(false);
    } catch (err) {
      setApiError(err.message || "API error");
      setLoading(false);
    }
  }, [authFetch, filter, page, rowsPerPage]);

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line
  }, [loadCustomers]);

  // Handle filter input/debounce
  const handleFilterChange = e => {
    setSearchInput(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // When user presses "Search" or hits enter, commit filter and reset page
  const applySearch = e => {
    e.preventDefault();
    setFilter(searchInput);
    setPage(1);
  };

  // Filtered customers (client-side filtering)
  let filteredCustomers = customers;
  Object.entries(filter).forEach(([key, val]) => {
    if (val && val.trim())
      filteredCustomers = filteredCustomers.filter(c => (c[key] || "").toLowerCase().includes(val.toLowerCase()));
  });
  // Pagination
  const pagedCustomers = filteredCustomers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // ---- CRUD handlers ----

  // Open create customer form
  const onNewCustomer = () => {
    setFormMode("create");
    setEditingCustomer(null);
    setShowForm(true);
    setFormStatus({ loading: false, error: "", success: "" });
  };

  // Open edit customer form
  const onEditCustomer = customer => {
    setFormMode("edit");
    setEditingCustomer(customer);
    setShowForm(true);
    setFormStatus({ loading: false, error: "", success: "" });
  };

  // Open delete confirmation
  const onDeleteCustomer = customer => {
    setDeletingCustomer(customer);
    setShowDelete(true);
    setDeleteStatus({ loading: false, error: "", success: "" });
  };

  // Submit create/edit form
  const handleFormSubmit = async formValues => {
    setFormStatus({ loading: true, error: "", success: "" });
    try {
      let res, data;
      if (formMode === "create") {
        res = await authFetch(`${API_BASE}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Create failed");
        setFormStatus({ loading: false, error: "", success: "Customer created!" });
      } else {
        res = await authFetch(`${API_BASE}/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Update failed");
        setFormStatus({ loading: false, error: "", success: "Customer updated!" });
      }
      setShowForm(false);
      setEditingCustomer(null);
      setTimeout(() => {
        loadCustomers();
      }, 400);
    } catch (err) {
      setFormStatus({ loading: false, error: err.message || "Save failed", success: "" });
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    setDeleteStatus({ loading: true, error: "", success: "" });
    try {
      const res = await authFetch(`${API_BASE}/customers/${deletingCustomer.id}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setDeleteStatus({ loading: false, error: "", success: "Deleted" });
        setShowDelete(false);
        setDeletingCustomer(null);
        setTimeout(() => {
          loadCustomers();
        }, 400);
      } else {
        let data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
    } catch (err) {
      setDeleteStatus({ loading: false, error: err.message || "Delete failed", success: "" });
    }
  };

  return (
    <section>
      <header style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ flex: 1 }}>Customers</h2>
        <button
          onClick={onNewCustomer}
          style={{
            padding: "8px 16px",
            background: "var(--button-bg)",
            color: "var(--button-text)",
            border: "none",
            borderRadius: 5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Customer
        </button>
      </header>

      {/* Filter/Search */}
      <form onSubmit={applySearch} style={{ marginBottom: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={searchInput.name}
          onChange={handleFilterChange}
          style={{ minWidth: 120 }}
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={searchInput.email}
          onChange={handleFilterChange}
          style={{ minWidth: 120 }}
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={searchInput.company}
          onChange={handleFilterChange}
          style={{ minWidth: 120 }}
        />
        <button
          type="submit"
          style={{
            padding: "6px 18px",
            background: "var(--button-bg)",
            color: "var(--button-text)",
            border: "none",
            borderRadius: 4,
            fontWeight: 500,
            cursor: "pointer",
            marginLeft: 5,
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchInput(getDefaultFilters());
            setFilter(getDefaultFilters());
            setPage(1);
          }}
          style={{
            background: "transparent",
            color: "var(--text-secondary)",
            border: "none",
            fontSize: 14,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Reset
        </button>
      </form>

      {/* Table/List */}
      {loading ? (
        <div>Loading customers...</div>
      ) : apiError ? (
        <div style={{ color: "crimson" }}>{apiError}</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ minWidth: 750, borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  {CUSTOMER_FIELDS.map(f => <th key={f.key} style={thStyle}>{f.label}</th>)}
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={CUSTOMER_FIELDS.length + 2} style={{ textAlign: "center", padding: 30 }}>No customers found.</td>
                  </tr>
                ) : (
                  pagedCustomers.map((cust, idx) => (
                    <tr key={cust.id} style={trStyle}>
                      <td style={tdStyle}>{(page - 1) * rowsPerPage + idx + 1}</td>
                      {CUSTOMER_FIELDS.map(f => (
                        <td key={f.key} style={tdStyle}>{cust[f.key] || ""}</td>
                      ))}
                      <td style={tdStyle}>
                        <button
                          onClick={() => onEditCustomer(cust)}
                          style={iconBtn}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteCustomer(cust)}
                          style={iconBtn}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={iconBtn}
                aria-label="Previous page"
              >
                &lt;
              </button>
              <span>
                Page {page} of {pagination.total}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total, p + 1))}
                disabled={page >= pagination.total}
                style={iconBtn}
                aria-label="Next page"
              >
                &gt;
              </button>
              <span>({pagination.totalCount} total results)</span>
            </div>
          )}
        </>
      )}

      {/* Form Modal (Create/Edit) */}
      {showForm && (
        <CustomerFormModal
          mode={formMode}
          customer={editingCustomer}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          status={formStatus}
        />
      )}

      {/* Delete Modal */}
      {showDelete && (
        <DeleteCustomerModal
          customer={deletingCustomer}
          onClose={() => setShowDelete(false)}
          onConfirm={confirmDelete}
          status={deleteStatus}
        />
      )}
    </section>
  );
}

// ---- Modal: Customer Form (Create/Edit) ----
function CustomerFormModal({ mode, customer, onClose, onSubmit, status }) {
  const [form, setForm] = useState(() =>
    customer || { name: "", email: "", phone: "", company: "", notes: "" }
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (customer && mode === "edit") setForm(customer);
    else if (mode === "create") setForm({ name: "", email: "", phone: "", company: "", notes: "" });
  }, [customer, mode]);

  // Validate basic
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
    return "";
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }
    onSubmit(form);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>{mode === "create" ? "Add Customer" : "Edit Customer"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 340 }}>
          {CUSTOMER_FIELDS.map(f => (
            <label key={f.key}>
              {f.label}
              {f.required && " *"}
              <input
                name={f.key}
                type={f.key === "email" ? "email" : "text"}
                value={form[f.key] || ""}
                onChange={handleChange}
                required={!!f.required}
                autoFocus={f.key === "name"}
              />
            </label>
          ))}
          {formError && <div style={{ color: "crimson", fontSize: 14 }}>{formError}</div>}
          {status.error && <div style={{ color: "crimson", fontSize: 14 }}>{status.error}</div>}
          {status.success && <div style={{ color: "green", fontSize: 14 }}>{status.success}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={modalBtnSecondary}>
              Cancel
            </button>
            <button
              type="submit"
              style={modalBtnPrimary}
              disabled={status.loading}
            >
              {status.loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Modal: Delete Customer ----
function DeleteCustomerModal({ customer, onClose, onConfirm, status }) {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Delete Customer</h3>
        <p>
          Are you sure you want to delete{" "}
          <span style={{ fontWeight: 600 }}>{customer.name}</span>?
        </p>
        {status.error && <div style={{ color: "crimson", fontSize: 14 }}>{status.error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <button type="button" onClick={onClose} style={modalBtnSecondary}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ ...modalBtnPrimary, background: "crimson" }}
            disabled={status.loading}
          >
            {status.loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Styles ----

const thStyle = {
  textAlign: "left",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  padding: "8px 6px",
  borderBottom: "1px solid var(--border-color)",
  fontWeight: 600,
  fontSize: 15,
};
const tdStyle = {
  padding: "7px 6px",
  borderBottom: "1px solid var(--border-color)",
};
const trStyle = {
  background: "var(--bg-primary)",
  transition: "background 0.2s",
};
const iconBtn = {
  background: "none",
  border: "none",
  color: "var(--text-primary)",
  fontSize: 19,
  cursor: "pointer",
  margin: "0 3px",
  opacity: 0.82,
};

// Modal overlay
const modalOverlayStyle = {
  position: "fixed",
  top: 0, left: 0, width: "100vw", height: "100vh",
  background: "rgba(0,0,0,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};
// Modal window
const modalStyle = {
  background: "var(--bg-primary)",
  borderRadius: 10,
  padding: "28px 24px 18px 24px",
  maxWidth: 420,
  width: "100%",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  border: "1px solid var(--border-color)",
};

// Modal buttons
const modalBtnPrimary = {
  background: "var(--button-bg)",
  color: "var(--button-text)",
  border: "none",
  borderRadius: 5,
  padding: "8px 18px",
  fontWeight: 600,
  letterSpacing: 0.5,
  cursor: "pointer",
};
const modalBtnSecondary = {
  background: "transparent",
  border: "1px solid var(--border-color)",
  borderRadius: 5,
  padding: "8px 18px",
  color: "var(--text-primary)",
  fontWeight: 500,
  cursor: "pointer",
};

