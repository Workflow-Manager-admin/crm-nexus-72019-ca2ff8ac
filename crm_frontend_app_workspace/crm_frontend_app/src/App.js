import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomersPage from "./pages/CustomersPage";
import InteractionsPage from "./pages/InteractionsPage";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <AuthProvider>
      <Router>
        <div className="crm-layout">
          <Sidebar />
          <div className="crm-main">
            <TopNav theme={theme} toggleTheme={toggleTheme} />
            <div className="crm-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interactions"
                  element={
                    <ProtectedRoute>
                      <InteractionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <TasksPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/metrics"
                  element={
                    <ProtectedRoute>
                      <MetricsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/export"
                  element={
                    <ProtectedRoute>
                      <ExportPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Sidebar navigation
function Sidebar() {
  const { isAuthenticated, user, logout } = require('./auth/AuthContext').useAuth();
  return (
    <aside className="crm-sidebar">
      <div className="crm-logo">CRM Nexus</div>
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
              Customers
            </NavLink>
          </li>
          <li>
            <NavLink to="/interactions" className={({ isActive }) => (isActive ? 'active' : '')}>
              Interactions
            </NavLink>
          </li>
          <li>
            <NavLink to="/tasks" className={({ isActive }) => (isActive ? 'active' : '')}>
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink to="/metrics" className={({ isActive }) => (isActive ? 'active' : '')}>
              Metrics
            </NavLink>
          </li>
          <li>
            <NavLink to="/export" className={({ isActive }) => (isActive ? 'active' : '')}>
              Export CSV
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="crm-sidebar-auth-links">
        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
              Login
            </NavLink>
            <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active' : '')}>
              Sign Up
            </NavLink>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14, marginBottom: 2 }}>
              {user ? <>Signed in as <strong>{user.username || user.email}</strong></> : null}
            </span>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'crimson',
                cursor: 'pointer',
                padding: 0,
                marginTop: 4,
                textAlign: 'left'
              }}
            >
              Log out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

// Top navigation bar
function TopNav({ theme, toggleTheme }) {
  return (
    <header className="crm-topnav">
      <h1 className="crm-title">CRM Dashboard</h1>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      {/* Placeholder: Add account avatar, notifications, etc. */}
    </header>
  );
}

// ---- Page Components (Skeletons) ---- //
function DashboardPage() {
  return <section><h2>Dashboard</h2><p>Overview charts and activity summary.</p></section>;
}
import TasksPage from "./pages/TasksPage";
function MetricsPage() {
  return <section><h2>Metrics & Analytics</h2><p>Analytics and metrics visualizations.</p></section>;
}
function ExportPage() {
  return <section><h2>Export Customers (CSV)</h2><p>Export customers as CSV file.</p></section>;
}
function NotFoundPage() {
  return <section><h2>404 Not Found</h2><p>The page you requested does not exist.</p></section>;
}

export default App;
