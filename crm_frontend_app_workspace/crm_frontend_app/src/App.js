import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  // Theme state; carried over
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="crm-layout">
        <Sidebar />
        <div className="crm-main">
          <TopNav theme={theme} toggleTheme={toggleTheme} />
          <div className="crm-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/interactions" element={<InteractionsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

// Sidebar navigation
function Sidebar() {
  return (
    <aside className="crm-sidebar">
      <div className="crm-logo">CRM Nexus</div>
      <nav>
        <ul>
          <li><NavLink to="/dashboard" className={({isActive})=>isActive?'active':''}>Dashboard</NavLink></li>
          <li><NavLink to="/customers" className={({isActive})=>isActive?'active':''}>Customers</NavLink></li>
          <li><NavLink to="/interactions" className={({isActive})=>isActive?'active':''}>Interactions</NavLink></li>
          <li><NavLink to="/tasks" className={({isActive})=>isActive?'active':''}>Tasks</NavLink></li>
          <li><NavLink to="/metrics" className={({isActive})=>isActive?'active':''}>Metrics</NavLink></li>
          <li><NavLink to="/export" className={({isActive})=>isActive?'active':''}>Export CSV</NavLink></li>
        </ul>
      </nav>
      <div className="crm-sidebar-auth-links">
        <NavLink to="/login" className={({isActive})=>isActive?'active':''}>Login</NavLink>
        <NavLink to="/signup" className={({isActive})=>isActive?'active':''}>Sign Up</NavLink>
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
function LoginPage() {
  return <section><h2>Login</h2><p>User login form will appear here.</p></section>;
}
function SignupPage() {
  return <section><h2>Sign Up</h2><p>Registration form will appear here.</p></section>;
}
function CustomersPage() {
  return <section><h2>Customers</h2><p>Customers table/list page.</p></section>;
}
function InteractionsPage() {
  return <section><h2>Interactions</h2><p>Interaction log - view and add interactions.</p></section>;
}
function TasksPage() {
  return <section><h2>Tasks</h2><p>Task assignment and tracking page.</p></section>;
}
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
