import api from "./api";

const token = () => localStorage.getItem("token");
const BASE = "http://localhost:5000";

const download = async (endpoint, filename) => {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Export failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const downloadWorkoutsCSV = (period) =>
  download(
    `/api/reports/export/workouts${period ? `?period=${period}` : ""}`,
    `workouts_export_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`
  );

export const downloadNutritionCSV = (period) =>
  download(
    `/api/reports/export/nutrition${period ? `?period=${period}` : ""}`,
    `nutrition_export_${new Date().toLocaleDateString().replace(/\//g, "-")}.csv`
  );

export const downloadPDFReport = (period) =>
  download(
    `/api/reports/pdf${period ? `?period=${period}` : ""}`,
    `fitness_progress_report_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`
  );