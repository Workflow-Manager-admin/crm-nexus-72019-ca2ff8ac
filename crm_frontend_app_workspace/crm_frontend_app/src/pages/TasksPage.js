import React, { useState, useEffect } from "react";
import "./TasksPage.css";

// Helper: API utilities for tasks
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";
function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// API calls (CRUD)
async function fetchCustomers(token) {
  const res = await fetch(`${API_BASE}/customers`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

async function fetchTasks(token, filters = {}) {
  let url = `${API_BASE}/tasks`;
  const q = [];
  if (filters.customerId) q.push(`customer_id=${filters.customerId}`);
  if (filters.status) q.push(`status=${filters.status}`);
  if (filters.duedate) q.push(`due=${filters.duedate}`);
  if (q.length) url += "?" + q.join("&");
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

async function createTask(token, data) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

async function updateTask(token, id, data) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

async function deleteTask(token, id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return true;
}

// UseAuth context hook import
import { useAuth } from "../auth/AuthContext";

// PUBLIC_INTERFACE
function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({
    customerId: "",
    status: "",
    duedate: ""
  });
  const [uiState, setUiState] = useState({
    error: null,
    confirm: null,
    isKanban: true,
    requestPending: false,
  });

  // Load customers and tasks
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCustomers(token),
      fetchTasks(token, filter)
    ]).then(([customers, tasks]) => {
      setCustomers(customers);
      setTasks(tasks);
      setLoading(false);
    }).catch(e => {
      setUiState((s) => ({ ...s, error: e.message }));
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [token]);

  // Filtered tasks (update when filters change)
  const reloadTasks = (_filter = filter) => {
    setLoading(true);
    fetchTasks(token, _filter)
      .then(tasks => {
        setTasks(tasks);
        setLoading(false);
      })
      .catch(e => {
        setUiState((s) => ({ ...s, error: e.message }));
        setLoading(false);
      });
  };
  const handleFilterChange = (e) => {
    const newFilter = { ...filter, [e.target.name]: e.target.value };
    setFilter(newFilter);
    reloadTasks(newFilter);
  };

  const openNewTask = () => {
    setEditingTask(null);
    setFormOpen(true);
  };
  const openEditTask = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (task) => {
    setUiState(s => ({ ...s, requestPending: true, error: null, confirm: null }));
    try {
      if (editingTask) {
        await updateTask(token, editingTask.id, task);
        setUiState(s => ({ ...s, confirm: "Task updated." }));
      } else {
        await createTask(token, task);
        setUiState(s => ({ ...s, confirm: "Task created." }));
      }
      closeForm();
      reloadTasks(filter);
    } catch (e) {
      setUiState(s => ({ ...s, error: e.message }));
    } finally {
      setUiState(s => ({ ...s, requestPending: false }));
    }
  };

  const handleDelete = async (task) => {
    if (window.confirm("Delete this task?")) {
      setUiState(s => ({ ...s, requestPending: true, error: null, confirm: null }));
      try {
        await deleteTask(token, task.id);
        setUiState(s => ({ ...s, confirm: "Task deleted." }));
        reloadTasks(filter);
      } catch (e) {
        setUiState(s => ({ ...s, error: e.message }));
      } finally {
        setUiState(s => ({ ...s, requestPending: false }));
      }
    }
  };

  // Kanban column structure
  const statusStages = ["todo", "in_progress", "completed"];
  const statusLabels = { todo: "To Do", in_progress: "In Progress", completed: "Completed" };
  const statusColors = { todo: "#E87A41", in_progress: "#1976D2", completed: "#23bb80" };

  // Responsive main rendering
  return (
    <section className="tasks-section">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <div className="task-view-toggle">
          <button
            className={`btn ${uiState.isKanban ? "active" : ""}`}
            onClick={() => setUiState((s) => ({ ...s, isKanban: true }))}
          >Kanban</button>
          <button
            className={`btn ${!uiState.isKanban ? "active" : ""}`}
            onClick={() => setUiState((s) => ({ ...s, isKanban: false }))}
          >Table</button>
        </div>
        <button className="btn btn-accent" onClick={openNewTask}>+ New Task</button>
      </div>

      {/* Filter Bar */}
      <div className="task-filter-bar">
        <select name="customerId" value={filter.customerId} onChange={handleFilterChange}>
          <option value="">All Customers</option>
          {customers.map(c =>
            <option key={c.id} value={c.id}>{c.name}</option>
          )}
        </select>
        <select name="status" value={filter.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          {statusStages.map(stage =>
            <option key={stage} value={stage}>{statusLabels[stage]}</option>
          )}
        </select>
        <input
          name="duedate"
          type="date"
          value={filter.duedate}
          onChange={handleFilterChange}
          placeholder="Due date"
        />
        <button className="btn" onClick={() => reloadTasks({})}>Reset</button>
      </div>

      {/* Status/Alerts */}
      {loading && <p className="loading">Loading...</p>}
      {uiState.error && <div className="error" role="alert">{uiState.error}</div>}
      {uiState.confirm && <div className="confirm">{uiState.confirm}</div>}

      {/* Main UI: Kanban or Table */}
      {!loading && tasks.length === 0 && <p>No tasks found.</p>}

      {!loading && uiState.isKanban && (
        <div className="task-kanban-board">
          {statusStages.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              label={statusLabels[status]}
              color={statusColors[status]}
              tasks={tasks.filter(t => t.status === status)}
              onEdit={openEditTask}
              onDelete={handleDelete}
              customers={customers}
            />
          ))}
        </div>
      )}

      {!loading && !uiState.isKanban && (
        <TaskTable
          tasks={tasks}
          customers={customers}
          statusLabels={statusLabels}
          statusColors={statusColors}
          onEdit={openEditTask}
          onDelete={handleDelete}
        />
      )}

      {/* Task Form Modal */}
      {formOpen && (
        <TaskFormModal
          customers={customers}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
          initialTask={editingTask}
          requestPending={uiState.requestPending}
        />
      )}
    </section>
  );
}

// Kanban Column Component
function KanbanColumn({ status, label, color, tasks, onEdit, onDelete, customers }) {
  return (
    <div className="kanban-column" style={{ borderTopColor: color }}>
      <h3>{label}</h3>
      <div className="kanban-tasks">
        {tasks.length === 0 && <div className="empty">No tasks</div>}
        {tasks.map(t => (
          <KanbanTaskCard
            key={t.id}
            task={t}
            onEdit={onEdit}
            onDelete={onDelete}
            customer={customers.find(c => c.id === t.customer_id)}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Task Card (Kanban)
function KanbanTaskCard({ task, onEdit, onDelete, customer }) {
  return (
    <div className="task-card" style={{ borderLeft: `4px solid ${getStatusColor(task.status)}` }}>
      <div className="task-title-row">
        <span className="task-title">{task.title}</span>
        <span className={`task-status badge badge-${task.status}`}>{TaskStatusLabel(task.status)}</span>
      </div>
      <div className="task-desc">{task.description}</div>
      <div className="task-meta">
        <span className="task-customer">
          {customer ? <>📇 {customer.name}</> : null}
        </span>
        <span className="task-due">
          {task.due_date ? <>📅 {formatDate(task.due_date)}</> : null}
        </span>
      </div>
      <div className="task-actions">
        <button className="btn btn-mini" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-mini btn-accent" onClick={() => onDelete(task)}>Delete</button>
      </div>
    </div>
  );
}

// Task Table View
function TaskTable({ tasks, customers, statusLabels, statusColors, onEdit, onDelete }) {
  return (
    <div className="task-table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.description}</td>
              <td>{(customers.find(c => c.id === t.customer_id) || {}).name || "-"}</td>
              <td>
                <span className={`badge badge-${t.status}`} style={{ backgroundColor: statusColors[t.status]}}>
                  {statusLabels[t.status] || t.status}
                </span>
              </td>
              <td>{formatDate(t.due_date)}</td>
              <td>
                <button className="btn btn-mini" onClick={() => onEdit(t)}>Edit</button>
                <button className="btn btn-mini btn-accent" onClick={() => onDelete(t)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Modal Task Form (Create/Edit)
function TaskFormModal({ customers, onClose, onSubmit, initialTask, requestPending }) {
  const [form, setForm] = useState(() =>
    initialTask ? {
      title: initialTask.title,
      description: initialTask.description,
      customer_id: initialTask.customer_id,
      status: initialTask.status,
      due_date: initialTask.due_date ? initialTask.due_date.substring(0, 10) : "",
    }
    : {
      title: "",
      description: "",
      customer_id: customers[0]?.id || "",
      status: "todo",
      due_date: "",
    }
  );
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.customer_id) {
      setError("Title and customer are required");
      return;
    }
    setError(null);
    onSubmit({
      ...form,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <h3>{initialTask ? "Edit Task" : "New Task"}</h3>
        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required disabled={requestPending} />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} disabled={requestPending} />
          </label>
          <label>
            Customer
            <select name="customer_id" value={form.customer_id} onChange={handleChange} required disabled={requestPending}>
              <option value="" disabled>Select customer</option>
              {customers.map(c =>
                <option key={c.id} value={c.id}>{c.name}</option>
              )}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange} disabled={requestPending}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            Due Date
            <input name="due_date" type="date" value={form.due_date || ""} onChange={handleChange} disabled={requestPending} />
          </label>
          {error && <div className="error">{error}</div>}
          <div className="task-modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={requestPending}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={requestPending}>
              {initialTask ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helpers
function formatDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}
function TaskStatusLabel(s) {
  if (s === "todo") return "To Do";
  if (s === "in_progress") return "In Progress";
  if (s === "completed") return "Completed";
  return s;
}
function getStatusColor(status) {
  if (status === "todo") return "#E87A41";
  if (status === "in_progress") return "#1976D2";
  if (status === "completed") return "#23bb80";
  return "#808080";
}

export default TasksPage;
