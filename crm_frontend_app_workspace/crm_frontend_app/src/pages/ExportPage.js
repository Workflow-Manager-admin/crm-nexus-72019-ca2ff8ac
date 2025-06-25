import React, { useState } from "react";

/**
 * ExportPage enables exporting customer data as a CSV file.
 * - Shows a button to trigger export.
 * - Calls backend API for CSV.
 * - Manages download (via Blob & anchor).
 * - Handles loading and error states.
 */
// PUBLIC_INTERFACE
function ExportPage() {
  // Handles exporting customers as CSV with loading & error feedback.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Backend endpoint location (assumed for customer CSV export)
  const EXPORT_URL = "/api/customers/export.csv";

  // Handler for CSV Export button
  // PUBLIC_INTERFACE
  const handleExport = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // Attach JWT if required (assumes token in localStorage)
      const token = localStorage.getItem("token");
      const response = await fetch(EXPORT_URL, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to export CSV");
      }

      // This assumes backend sets correct 'Content-Disposition' and mime type.
      const blob = await response.blob();
      // Parse filename from content-disposition or use fallback
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "customers.csv";
      if (contentDisposition) {
        const match = /filename[^;=\n]*=(['"]?)([^'";\n]*)\1/.exec(contentDisposition);
        if (match && match[2]) {
          fileName = match[2];
        }
      }
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (e) {
      setError(e.message || "Unable to export customers.");
    }
    setLoading(false);
  };

  return (
    <section>
      <h2>Export Customers (CSV)</h2>
      <p>You can export the current customer list as a CSV file for use in spreadsheets or backups.</p>
      <button
        className="btn"
        style={{ minWidth: 160 }}
        onClick={handleExport}
        disabled={loading}
        data-testid="export-btn"
      >
        {loading ? "Exporting..." : "Export as CSV"}
      </button>
      {success && <div style={{ color: "green", marginTop: 10 }}>Export successful! File downloaded.</div>}
      {error && <div style={{ color: "crimson", marginTop: 10 }}>{error}</div>}
    </section>
  );
}

export default ExportPage;
