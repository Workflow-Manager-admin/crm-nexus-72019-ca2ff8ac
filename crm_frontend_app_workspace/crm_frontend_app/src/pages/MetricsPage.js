import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

import "../App.css";

// Project brand colors (from theme)
const BRAND_COLORS = ["#1976D2", "#424242", "#FFB300", "#E87A41", "#86C8BC", "#D72660", "#4361EE", "#F6C065"];
const PIE_COLORS = [...BRAND_COLORS, "#AAA", "#8884D8", "#F36", "#6D8"];

// PUBLIC_INTERFACE
function MetricsPage() {
  /**
   * MetricsPage fetches and displays summary counts and charts for
   * customer, task, and interaction analytics.
   */
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Fetch analytics data on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMetricsSummary()
      .then((data) => { setSummary(data); setLoading(false); })
      .catch((err) => { setError("Failed to load analytics."); setLoading(false); });
  }, []);

  // Example backend API fetch (update endpoint as per backend)
  // PUBLIC_INTERFACE
  async function fetchMetricsSummary() {
    // Assumes backend metrics API at /api/metrics/summary (aggregate) and /api/metrics/timeseries
    // May need authentication token header if backend protected
    let token = localStorage.getItem("token");
    const summaryRes = await fetch("/api/metrics/summary", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!summaryRes.ok) throw new Error("Fetch summary failed");
    const summaryData = await summaryRes.json();

    // Fetch time-series breakdowns
    const timeseriesRes = await fetch("/api/metrics/timeseries", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!timeseriesRes.ok) throw new Error("Fetch timeseries failed");
    const timeseriesData = await timeseriesRes.json();

    // Optional: fetch per-user, per-customer or status if needed
    // Merge and return all for component state
    return { ...summaryData, ...timeseriesData };
  }

  // Helper renderers
  function renderSummaryCards() {
    // Show big numbers (counts) for key entities
    if (!summary) return null;
    return (
      <div className="dashboard-summaries">
        <SummaryCard label="Customers" value={summary.total_customers || 0} color={BRAND_COLORS[0]} />
        <SummaryCard label="Tasks" value={summary.total_tasks || 0} color={BRAND_COLORS[1]} />
        <SummaryCard label="Interactions" value={summary.total_interactions || 0} color={BRAND_COLORS[2]} />
        <SummaryCard label="Completed Tasks" value={summary.completed_tasks || 0} color={BRAND_COLORS[3]} />
        <SummaryCard label="Pending Tasks" value={summary.pending_tasks || 0} color={BRAND_COLORS[4]} />
      </div>
    );
  }

  function renderCharts() {
    if (!summary) return null;

    return (
      <div className="dashboard-charts">
        <div className="dashboard-chart">
          <h4>Tasks Over Time</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={summary.tasks_timeseries || []}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke={BRAND_COLORS[1]} name="Created Tasks"/>
              <Line type="monotone" dataKey="completed" stroke={BRAND_COLORS[3]} name="Completed Tasks"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart">
          <h4>Interactions by Type</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={summary.interactions_by_type || []}
                dataKey="count"
                nameKey="type"
                cx="50%" cy="50%"
                outerRadius={70}
                fill={BRAND_COLORS[2]}
                label
              >
                {(summary.interactions_by_type || []).map((entry, idx) =>
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                )}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-chart">
          <h4>Task Status Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.tasks_by_status || []}>
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={BRAND_COLORS[1]} name="Tasks"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <section className="dashboard-metrics-section">
      <h2>Metrics & Analytics</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
        Here you can see visual analytics of customers, tasks, and interactions tracked by CRM Nexus.
      </p>
      {loading && <div style={{ margin: 40 }}>Loading metrics...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {!loading && !error && (
        <>
          {renderSummaryCards()}
          {renderCharts()}
        </>
      )}
    </section>
  );
}

// Simple card presentation for summary numbers
function SummaryCard({ label, value, color }) {
  return (
    <div className="dashboard-summary-card" style={{
      background: color,
      color: "#fff",
      borderRadius: 8,
      minWidth: 120,
      padding: 20,
      margin: 8,
      textAlign: "center",
      boxShadow: "0 2px 8px 0 rgba(20,20,20,0.07)"
    }}>
      <div style={{ fontSize: 30, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 16, marginTop: 5, opacity: 0.9 }}>{label}</div>
    </div>
  );
}

export default MetricsPage;
