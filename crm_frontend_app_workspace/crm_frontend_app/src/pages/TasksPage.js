import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

/**
 * TasksPage — Full-featured UI for customer tasks.
 * Features:
 *  - Table and Kanban/List views for tasks (switchable)
 *  - Create/edit forms (modal), delete (with confirm)
 *  - Filters: by status, customer, assigned user, due date range
 *  - Status and due date indicators
 *  - API integration for backend CRUD (with JWT)
 *  - Full error/loading/confirmation state UX
 */

// -- API Util --
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Field definitions
const TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];
const TASK_FIELDS = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description" },
  { key: "dueDate", label: "Due Date", required: true },
  { key: "status", label: "Status", required: true },
  { key: "userId", label: "Assignee", required: true },
  { key: "customerId", label: "Customer", required: true },
];

// Helper default filter object
function getDefaultFilters() {
  return {
    status: "",
    customerId: "",
    userId: "",
    dueDateFrom: "",
    dueDateTo: "",
  };
}

export default function TasksPage() {
  const { authFetch, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [filter, setFilter] = useState(getDefaultFilters());
  const [searchInput, setSearchInput] = useState(getDefaultFilters());
  const [kanban, setKanban] = useState(true); // toggle table/Kanban
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // or "edit"
  const [editingTask, setEditingTask] = useState(null);
  const [formStatus, setFormStatus] = useState({ loading: false, error: "", success: "" });
  const [showDelete, setShowDelete] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: "", success: "" });

  // Data loading (tasks, customers, users)
  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      // Fetch in parallel: tasks, customers, users
      const [customersRes, usersRes, tasksRes] = await Promise.all([
        authFetch(`${API_BASE}/customers`),
        // There is no users list endpoint, so get unique from assigned tasks + current user
        // For demo, fallback to current user
        Promise.resolve({ ok: true, json: () => Promise.resolve(user ? [user] : []) }),
        // Filtered query for tasks
        authFetch(
          `${API_BASE}/tasks${composeTaskQuery(filter)}`
        ),
      ]);
      if (!customersRes.ok) throw new Error("Failed to load customers");
      const customersData = await customersRes.json();
      let usersData = await usersRes.json();
      // Try to extract all task assignees (users) from tasks
      let tasksData = await tasksRes.json();
      const taskUsers = [
        ...new Map(
          (tasksData || [])
            .filter((t) => t.User)
            .map((t) => [t.User.id, t.User])
        ).values(),
      ];
      if (usersData.length === 0 && taskUsers.length > 0) usersData = taskUsers;
      setCustomers(customersData);
      setUsers(usersData);
      setTasks(tasksData || []);
      setLoading(false);
    } catch (e) {
      setApiError(e.message || "API error loading tasks.");
      setLoading(false);
    }
  }, [authFetch, filter, user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Handlers for filter inputs (searchInput state)
  function handleFilterChange(e) {
    setSearchInput((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  function applySearch(e) {
    if (e) e.preventDefault();
    setFilter(searchInput);
  }
  function resetFilters() {
    setSearchInput(getDefaultFilters());
    setFilter(getDefaultFilters());
  }

  // ---- CRUD modal handlers ----
  function openNewTask() {
    setShowForm(true);
    setFormMode("create");
    setEditingTask(null);
    setFormStatus({ loading: false, error: "", success: "" });
  }
  function openEditTask(task) {
    setShowForm(true);
    setFormMode("edit");
    setEditingTask(task);
    setFormStatus({ loading: false, error: "", success: "" });
  }
  function openDeleteTask(task) {
    setShowDelete(true);
    setDeletingTask(task);
    setDeleteStatus({ loading: false, error: "", success: "" });
  }

  // Handle form submit (create/edit)
  async function handleFormSubmit(formValues) {
    setFormStatus({ loading: true, error: "", success: "" });
    try {
      // Validate dueDate
      if (!formValues.dueDate) throw new Error("Due Date is required");
      let bodyVals = { ...formValues };
      // Cast fields
      bodyVals.customerId = Number(bodyVals.customerId);
      bodyVals.userId = Number(bodyVals.userId);
      bodyVals.status = bodyVals.status || "todo";
      // Format due date (ISO)
      let dueDateIso = bodyVals.dueDate;
      if (!dueDateIso.includes("T")) {
        dueDateIso = new Date(dueDateIso).toISOString();
      }
      bodyVals.dueDate = dueDateIso;
      let res, data;
      if (formMode === "create") {
        res = await authFetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyVals),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Create failed");
        setFormStatus({ loading: false, error: "", success: "Task created!" });
      } else {
        res = await authFetch(`${API_BASE}/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyVals),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Update failed");
        setFormStatus({ loading: false, error: "", success: "Task updated!" });
      }
      setTimeout(() => {
        setShowForm(false);
        setEditingTask(null);
        loadAll();
      }, 340);
    } catch (err) {
      setFormStatus({ loading: false, error: err.message || "Failed", success: "" });
    }
  }

  // Confirm delete
  async function confirmDelete() {
    setDeleteStatus({ loading: true, error: "", success: "" });
    try {
      const res = await authFetch(`${API_BASE}/tasks/${deletingTask.id}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setDeleteStatus({ loading: false, error: "", success: "Deleted" });
        setTimeout(() => {
          setShowDelete(false);
          setDeletingTask(null);
          loadAll();
        }, 340);
      } else {
        let data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
    } catch (err) {
      setDeleteStatus({ loading: false, error: err.message || "Delete failed", success: "" });
    }
  }

  // --- Filtered/derived state for render ---
  // Optionally filter tasks further client-side if desired

  return (
    <section>
      <header style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 15 }}>
        <h2 style={{ flex: 1 }}>Tasks</h2>
        <button onClick={() => setKanban((k) => !k)} style={toggleBtnStyle}>
          {kanban ? "Table View" : "Kanban View"}
        </button>
        <button onClick={openNewTask} style={primaryBtn}>
          + New Task
        </button>
      </header>

      {/* Filter/search bar */}
      <form
        onSubmit={applySearch}
        style={{
          display: "flex",
          gap: 13,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 10,
        }}
      >
        <select
          name="status"
          value={searchInput.status}
          onChange={handleFilterChange}
          style={{ minWidth: 110 }}
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          name="customerId"
          value={searchInput.customerId}
          onChange={handleFilterChange}
          style={{ minWidth: 120 }}
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="userId"
          value={searchInput.userId}
          onChange={handleFilterChange}
          style={{ minWidth: 112 }}
        >
          <option value="">All Users</option>
          {users.map((u) =>
            u ? (
              <option key={u.id} value={u.id}>
                {u.username || u.email || `User ${u.id}`}
              </option>
            ) : null
          )}
        </select>
        <input
          name="dueDateFrom"
          type="date"
          value={searchInput.dueDateFrom}
          onChange={handleFilterChange}
          title="Due after"
        />
        <input
          name="dueDateTo"
          type="date"
          value={searchInput.dueDateTo}
          onChange={handleFilterChange}
          title="Due before"
        />
        <button type="submit" style={primaryBtnSmall}>
          Filter
        </button>
        <button
          type="button"
          style={secondaryBtnSmall}
          onClick={resetFilters}
        >
          Reset
        </button>
      </form>
      {/* End filters */}

      {loading ? (
        <div>Loading tasks...</div>
      ) : apiError ? (
        <div style={{ color: "crimson" }}>{apiError}</div>
      ) : tasks.length === 0 ? (
        <div style={{ color: "gray", marginTop: 18 }}>No tasks found.</div>
      ) : kanban ? (
        <TaskKanbanView
          tasks={tasks}
          onEdit={openEditTask}
          onDelete={openDeleteTask}
        />
      ) : (
        <TaskTableView
          tasks={tasks}
          customers={customers}
          users={users}
          onEdit={openEditTask}
          onDelete={openDeleteTask}
        />
      )}

      {/* Modal task form */}
      {showForm && (
        <TaskFormModal
          mode={formMode}
          task={editingTask}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
          status={formStatus}
          customers={customers}
          users={users}
        />
      )}
      {/* Modal delete */}
      {showDelete && (
        <DeleteTaskModal
          task={deletingTask}
          onClose={() => setShowDelete(false)}
          onConfirm={confirmDelete}
          status={deleteStatus}
        />
      )}
    </section>
  );
}

// --- Task Table View ---
function TaskTableView({ tasks, customers, users, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <table style={{ minWidth: 890, borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Due</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Assignee</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 32 }}>
                No tasks found
              </td>
            </tr>
          ) : (
            tasks.map((task, idx) => (
              <tr key={task.id} style={trStyle}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{task.title}</td>
                <td style={tdStyle}><StatusBadge status={task.status} /></td>
                <td style={tdStyle}>
                  <DueDateLabel dueDate={task.dueDate} status={task.status} />
                </td>
                <td style={tdStyle}>
                  {task.Customer
                    ? task.Customer.name
                    : (customers.find((c) => c.id === task.customerId) || {}).name ||
                      `#${task.customerId}`}
                </td>
                <td style={tdStyle}>
                  {task.User
                    ? task.User.username || task.User.email
                    : (users.find((u) => u.id === task.userId) || {}).username ||
                      `#${task.userId}`}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => onEdit(task)}
                    style={iconBtn}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(task)}
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
  );
}

// --- Kanban ("Board") View ---
function TaskKanbanView({ tasks, onEdit, onDelete }) {
  // Split tasks into columns by status
  const groups = {};
  TASK_STATUSES.forEach((status) => {
    groups[status.value] = tasks.filter((t) => t.status === status.value);
  });
  return (
    <div style={{ display: "flex", gap: 18, marginTop: 18, overflowX: "auto" }}>
      {TASK_STATUSES.map((status) => (
        <div
          key={status.value}
          style={{
            flex: "1 1 0",
            minWidth: 210,
            background: "var(--bg-secondary)",
            borderRadius: 9,
            padding: "12px 14px 22px 14px",
            border: "1.4px solid var(--border-color)",
            boxShadow: "0 2px 8px rgba(70,90,127,0.06)",
          }}
        >
          <h4 style={{ marginTop: 6, marginBottom: 18, textAlign: "center" }}>
            {status.label}
          </h4>
          {groups[status.value].length === 0 ? (
            <div style={{ color: "#919191", marginTop: 15, textAlign: "center" }}>
              None
            </div>
          ) : (
            groups[status.value].map((task) => (
              <div
                key={task.id}
                style={{
                  background: "var(--bg-primary)",
                  borderRadius: 7,
                  boxShadow: "0 1px 4px rgba(70,86,127,.08)",
                  marginBottom: 16,
                  padding: "13px 10px 7px 12px",
                  borderLeft: `5px solid ${getStatusColor(task.status)}`,
                }}
              >
                <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 3 }}>
                  {task.title}
                </div>
                <div style={{ fontSize: 14, marginBottom: 2, color: "#7d7d86" }}>
                  <DueDateLabel dueDate={task.dueDate} status={task.status} />
                </div>
                <div style={{ fontSize: 13, color: "#727282" }}>
                  <span>
                    <b>Assignee:</b> {task.User?.username || task.User?.email || `#${task.userId}`}
                  </span>
                  <br />
                  <span>
                    <b>Customer:</b> {task.Customer?.name || `#${task.customerId}`}
                  </span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => onEdit(task)}
                    style={iconBtn}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(task)}
                    style={iconBtn}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

// -- Task Status Badge Component --
function StatusBadge({ status }) {
  const st = TASK_STATUSES.find((s) => s.value === status);
  return (
    <span
      style={{
        background: getStatusColor(status),
        color: "#fff",
        borderRadius: 7,
        padding: "3px 11px",
        fontSize: 13,
        fontWeight: 600,
        verticalAlign: "middle",
        letterSpacing: "0.03em",
      }}
      title={st ? st.label : status}
    >
      {st ? st.label : String(status)}
    </span>
  );
}
function getStatusColor(status) {
  switch (status) {
    case "in_progress":
      return "#1976D2";
    case "todo":
      return "#FFB300";
    case "done":
      return "#228D5A";
    case "cancelled":
      return "#B71C1C";
    default:
      return "#888";
  }
}

// -- Due Date Label with Late/Upcoming Alerts --
function DueDateLabel({ dueDate, status }) {
  if (!dueDate) return "?";
  try {
    const dt = new Date(dueDate);
    const now = new Date();
    const day = dt.toLocaleDateString([], { month: "short", day: "numeric" });
    const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let label = `${day} ${time}`;
    if (status !== "done" && status !== "cancelled") {
      if (dt.getTime() < now.getTime() - 60 * 60 * 1000) {
        label += " ";
        return (
          <span style={{ color: "crimson", fontWeight: 650 }} title="Overdue">
            {label} 🔔
          </span>
        );
      }
      if (dt.getTime() < now.getTime() + 36 * 60 * 60 * 1000) {
        label += " ";
        return (
          <span style={{ color: "#FFB300", fontWeight: 520 }} title="Due Soon">
            {label} ⏰
          </span>
        );
      }
    }
    return <span>{label}</span>;
  } catch {
    return String(dueDate);
  }
}

// --- Modal: Task Form (Create/Edit) ---
function TaskFormModal({
  mode,
  task,
  onClose,
  onSubmit,
  status,
  customers,
  users,
}) {
  const [form, setForm] = useState(() =>
    task
      ? {
          title: task.title || "",
          description: task.description || "",
          dueDate: task.dueDate
            ? formatDateForInput(task.dueDate)
            : getTodayDateTime(),
          status: task.status || "todo",
          userId: task.userId || "",
          customerId: task.customerId || "",
        }
      : {
          title: "",
          description: "",
          dueDate: getTodayDateTime(),
          status: "todo",
          userId: users[0]?.id || "",
          customerId: customers[0]?.id || "",
        }
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (mode === "edit" && task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? formatDateForInput(task.dueDate) : getTodayDateTime(),
        status: task.status || "todo",
        userId: task.userId || "",
        customerId: task.customerId || "",
      });
    }
    if (mode === "create") {
      setForm((f) => ({
        ...f,
        dueDate: getTodayDateTime(),
      }));
    }
    // eslint-disable-next-line
  }, [mode, task]);

  // Basic validation
  function validate() {
    if (!form.title.trim()) return "Title is required";
    if (!form.dueDate) return "Due date required";
    if (!form.status) return "Status required";
    if (!form.userId) return "Assignee required";
    if (!form.customerId) return "Customer required";
    return "";
  }
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }
    onSubmit(form);
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>{mode === "create" ? "Add Task" : "Edit Task"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 315 }}>
          <label>
            Title *
            <input name="title" value={form.title} onChange={handleChange} autoFocus required />
          </label>
          <label>
            Description
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Task details/notes"
            />
          </label>
          <label>
            Due Date *
            <input
              name="dueDate"
              type="datetime-local"
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Status *
            <select name="status" value={form.status} onChange={handleChange} required>
              {TASK_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assignee *
            <select name="userId" value={form.userId} onChange={handleChange} required>
              {users.map((u) =>
                u ? (
                  <option key={u.id} value={u.id}>
                    {u.username || u.email || `User ${u.id}`}
                  </option>
                ) : null
              )}
            </select>
          </label>
          <label>
            Customer *
            <select name="customerId" value={form.customerId} onChange={handleChange} required>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {formError && <div style={{ color: "crimson", fontSize: 14 }}>{formError}</div>}
          {status.error && <div style={{ color: "crimson", fontSize: 14 }}>{status.error}</div>}
          {status.success && <div style={{ color: "green", fontSize: 14 }}>{status.success}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onClose} style={modalBtnSecondary}>Cancel</button>
            <button type="submit" style={modalBtnPrimary} disabled={status.loading}>
              {status.loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Modal: Delete Task ---
function DeleteTaskModal({ task, onClose, onConfirm, status }) {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Delete Task</h3>
        <p>
          Are you sure you want to delete{" "}
          <span style={{ fontWeight: 600 }}>{task.title}</span>?
        </p>
        {status.error && <div style={{ color: "crimson", fontSize: 14 }}>{status.error}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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

// --- Utilities ---

// Compose API query for task filters
function composeTaskQuery(f) {
  const params = [];
  if (f.customerId) params.push(`customerId=${encodeURIComponent(f.customerId)}`);
  if (f.userId) params.push(`userId=${encodeURIComponent(f.userId)}`);
  if (f.status) params.push(`status=${encodeURIComponent(f.status)}`);
  if (f.dueDateFrom) params.push(`dueDateFrom=${encodeURIComponent(f.dueDateFrom)}`);
  if (f.dueDateTo) params.push(`dueDateTo=${encodeURIComponent(f.dueDateTo)}`);
  return params.length ? `?${params.join("&")}` : "";
}
function getTodayDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
function formatDateForInput(date) {
  // date is ISO string
  try {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return date;
  }
}

// --- Styles ---
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
  fontSize: 18,
  cursor: "pointer",
  margin: "0 3px",
  opacity: 0.82,
};
const primaryBtn = {
  background: "var(--button-bg)",
  color: "var(--button-text)",
  border: "none",
  borderRadius: 5,
  padding: "8px 16px",
  fontWeight: 600,
  cursor: "pointer",
};
const primaryBtnSmall = {...primaryBtn, padding: "6px 14px", fontSize: 14};
const secondaryBtnSmall = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border-color)",
  fontSize: 14,
  padding: "5px 10px",
  borderRadius: 4,
  cursor: "pointer"
};
const toggleBtnStyle = {
  ...primaryBtnSmall,
  background: "#FFF",
  color: "var(--button-bg)",
  border: "1.1px solid var(--button-bg)",
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.17)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};
const modalStyle = {
  background: "var(--bg-primary)",
  borderRadius: 10,
  padding: "28px 24px 18px 24px",
  maxWidth: 420,
  width: "100%",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
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

