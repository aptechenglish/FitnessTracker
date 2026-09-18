import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  getMeasurements,
  updateMeasurement,
  deleteMeasurement,
  getProgress,
} from "../services/measurements";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import Reveal from "../components/Reveal";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.color = "#8a8a8a";
ChartJS.defaults.borderColor = "rgba(255, 255, 255, 0.1)";

const emptyMeasurement = () => ({
  date: new Date().toISOString().split("T")[0],
  weight: "",
  bodyFat: "",
  measurements: {
    chest: "", waist: "", hips: "", armsLeft: "", armsRight: "",
    thighsLeft: "", thighsRight: "", neck: "", calvesLeft: "", calvesRight: "",
  },
  running: { distance: "", timeMinutes: "", pacePerKm: "" },
  lifting: { benchPress: "", deadlift: "", squat: "", overheadPress: "" },
  other: { dailySteps: "", sleepHours: "", caloriesBurned: "", restHeartRate: "" },
  notes: "",
});

const Progress = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyMeasurement());
  const [saving, setSaving] = useState(false);
  const [chartType, setChartType] = useState("weights");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([getMeasurements(), getProgress()]);
      setMeasurements(mRes.data);
      setProgress(pRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load progress data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdd = () => navigate("/progress/add");

  const openEdit = (m) => {
    setEditing(m._id);
    setForm({
      date: m.date.split("T")[0],
      weight: m.weight || "",
      bodyFat: m.bodyFat || "",
      measurements: { ...m.measurements },
      running: { ...m.running },
      lifting: { ...m.lifting },
      other: { ...m.other },
      notes: m.notes || "",
    });
    setShowModal(true);
  };

  const handleNestedChange = (group, field, value) => {
    setForm({
      ...form,
      [group]: { ...form[group], [field]: value === "" ? "" : Number(value) || 0 },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
      };
      await updateMeasurement(editing, payload);
      toast.success("Progress entry updated!");
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this progress entry?")) return;
    try {
      await deleteMeasurement(id);
      toast.success("Entry deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const buildLineData = (labels, datasets) => ({
    labels,
    datasets,
  });

  const lineOptions = (unit) => ({
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} ${unit}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: false },
    },
  });

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const weightData = chartType === "weights"
    ? buildLineData(
        (progress?.weights || []).map((w) => fmtDate(w.date)),
        [
          {
            label: "Weight (kg)",
            data: (progress?.weights || []).map((w) => w.value),
            borderColor: "#e53935",
            backgroundColor: "rgba(229,57,53,0.12)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
          },
        ]
      )
    : null;

  const bodyFatData = chartType === "bodyfat"
    ? buildLineData(
        (progress?.bodyFat || []).map((b) => fmtDate(b.date)),
        [
          {
            label: "Body Fat (%)",
            data: (progress?.bodyFat || []).map((b) => b.value),
            borderColor: "#e53935",
            backgroundColor: "rgba(229,57,53,0.12)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
          },
        ]
      )
    : null;

  const liftingSlots = [
    { key: "benchPress", label: "Bench Press", color: "#e53935" },
    { key: "deadlift", label: "Deadlift", color: "#b71c1c" },
    { key: "squat", label: "Squat", color: "#8a8a8a" },
    { key: "overheadPress", label: "OH Press", color: "#c62828" },
  ];

  const liftingData = chartType === "lifting"
    ? buildLineData(
        (progress?.lifting?.benchPress || []).map((l) => fmtDate(l.date)),
        liftingSlots
          .filter((slot) => (progress?.lifting?.[slot.key] || []).length > 0)
          .map((slot) => ({
            label: slot.label,
            data: (progress?.lifting?.[slot.key] || []).map((l) => l.value),
            borderColor: slot.color,
            backgroundColor: "transparent",
            tension: 0.3,
            pointRadius: 4,
          }))
      )
    : null;

  const bodyData = chartType === "body"
    ? buildLineData(
        (progress?.measurements || []).map((m) => fmtDate(m.date)),
        [
          { label: "Chest", data: (progress?.measurements || []).map((m) => m.chest), borderColor: "#e53935", backgroundColor: "transparent", tension: 0.3 },
          { label: "Waist", data: (progress?.measurements || []).map((m) => m.waist), borderColor: "#c62828", backgroundColor: "transparent", tension: 0.3 },
          { label: "Hips", data: (progress?.measurements || []).map((m) => m.hips), borderColor: "#8a8a8a", backgroundColor: "transparent", tension: 0.3 },
        ]
      )
    : null;

  const runningData = chartType === "running"
    ? buildLineData(
        (progress?.running || []).map((r) => fmtDate(r.date)),
        [
          {
            label: "Distance (km)",
            data: (progress?.running || []).map((r) => r.distance),
            borderColor: "#e53935",
            backgroundColor: "transparent",
            tension: 0.3,
          },
          {
            label: "Time (min)",
            data: (progress?.running || []).map((r) => r.timeMinutes),
            borderColor: "#c62828",
            backgroundColor: "transparent",
            tension: 0.3,
          },
        ]
      )
    : null;

  const chartMap = {
    weights: { icon: "scale", label: "Weight", data: weightData, unit: "kg" },
    bodyfat: { icon: "goals", label: "Body Fat", data: bodyFatData, unit: "%" },
    lifting: { icon: "workouts", label: "Lifting", data: liftingData, unit: "kg" },
    body: { icon: "sparkles", label: "Measurements", data: bodyData, unit: "cm" },
    running: { icon: "activity", label: "Running", data: runningData, unit: "km" },
  };

  const chartTypes = [
    { value: "weights", icon: "scale", label: "Weight" },
    { value: "bodyfat", icon: "goals", label: "Body Fat" },
    { value: "lifting", icon: "workouts", label: "Lifting" },
    { value: "body", icon: "sparkles", label: "Measurements" },
    { value: "running", icon: "activity", label: "Running" },
  ];

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="vip-banner flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold flex items-center gap-3"><Icon name="progress" className="w-7 h-7" /> Progress Tracking</h1>
            <p className="text-white/75 mt-1">Record your weight, measurements, running & lifting progress</p>
          </div>
          <button
            onClick={openAdd}
            className="vip-btn-primary px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 relative z-10"
          >
            <span className="text-lg">+</span> Add Entry
          </button>
        </div>

        <Reveal>
        <div className="vip-card p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-5">
            {chartTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setChartType(t.value)}
                className={`vip-chip ${chartType === t.value ? "vip-chip-active" : ""}`}
              >
                <Icon name={t.icon} className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chartMap[chartType].data?.datasets?.[0]?.data?.length > 1 ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="vip-accent"><Icon name="analytics" className="w-4 h-4" /></span>
                <h2 className="vip-card-title">
                  {chartMap[chartType].label} Progress
                </h2>
              </div>
              <div className="h-64 sm:h-80 md:h-96 w-full min-w-0">
                <Line data={chartMap[chartType].data} options={lineOptions(chartMap[chartType].unit)} />
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Icon name="progress" className="w-14 h-14 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Not enough data yet</h3>
              <p className="text-gray-500 mb-4">Record at least 2 entries for this metric to see the chart</p>
              <button onClick={openAdd} className="vip-btn-primary px-5 py-2 rounded-lg font-semibold transition">
                Add Entry
              </button>
            </div>
          )}
        </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : measurements.length === 0 ? (
          <div className="vip-card p-16 text-center">
            <Icon name="sparkles" className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-gray-200 mb-2">No progress entries yet</h3>
            <p className="text-gray-500 mb-6">Start logging your measurements to track your fitness journey!</p>
            <button onClick={openAdd} className="vip-btn-primary px-6 py-3 rounded-lg font-semibold transition">
              Add First Entry
            </button>
          </div>
        ) : (
          <div>
            <Reveal>
            <p className="vip-section-label">History</p>
            <div className="vip-card overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800/60">
                  <tr className="text-sm text-gray-400">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Weight</th>
                    <th className="px-6 py-3 font-medium">Body Fat</th>
                    <th className="px-6 py-3 font-medium">Waist</th>
                    <th className="px-6 py-3 font-medium">Run Dist</th>
                    <th className="px-6 py-3 font-medium">Bench</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m._id} className="border-t hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">{fmtDate(m.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">{m.weight > 0 ? `${m.weight} kg` : "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">{m.bodyFat > 0 ? `${m.bodyFat}%` : "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">{m.measurements?.waist > 0 ? `${m.measurements.waist} cm` : "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">{m.running?.distance > 0 ? `${m.running.distance} km` : "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">{m.lifting?.benchPress > 0 ? `${m.lifting.benchPress} kg` : "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(m)}
                            className="vip-btn-primary px-3 py-1.5 rounded text-xs font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="bg-[#2a2a2a] hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </Reveal>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Edit Progress Entry" : "Add Progress Entry"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:text-gray-200"><Icon name="x" className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional note"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon name="scale" className="w-5 h-5 text-gray-500" /> Weight & Body</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number" step="0.1"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="e.g. 75.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Fat (%)</label>
                    <input
                      type="number" step="0.1"
                      value={form.bodyFat}
                      onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5 text-gray-500" /> Body Measurements (cm)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    ["chest", "Chest"], ["waist", "Waist"], ["hips", "Hips"],
                    ["armsLeft", "Arm (L)"], ["armsRight", "Arm (R)"],
                    ["thighsLeft", "Thigh (L)"], ["thighsRight", "Thigh (R)"],
                    ["neck", "Neck"], ["calvesLeft", "Calf (L)"], ["calvesRight", "Calf (R)"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="number" step="0.1"
                        value={form.measurements[key]}
                        onChange={(e) => handleNestedChange("measurements", key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon name="activity" className="w-5 h-5 text-gray-500" /> Running</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                    <input
                      type="number" step="0.1"
                      value={form.running.distance}
                      onChange={(e) => handleNestedChange("running", "distance", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time (min)</label>
                    <input
                      type="number"
                      value={form.running.timeMinutes}
                      onChange={(e) => handleNestedChange("running", "timeMinutes", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pace (min/km)</label>
                    <input
                      type="number" step="0.1"
                      value={form.running.pacePerKm}
                      onChange={(e) => handleNestedChange("running", "pacePerKm", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon name="workouts" className="w-5 h-5 text-gray-500" /> Lifting (kg)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    ["benchPress", "Bench"], ["deadlift", "Deadlift"],
                    ["squat", "Squat"], ["overheadPress", "OH Press"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="number"
                        value={form.lifting[key]}
                        onChange={(e) => handleNestedChange("lifting", key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon name="analytics" className="w-5 h-5 text-gray-500" /> Other Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    ["dailySteps", "Steps"], ["sleepHours", "Sleep (h)"],
                    ["caloriesBurned", "Cal Burned"], ["restHeartRate", "Rest HR"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="number"
                        value={form.other[key]}
                        onChange={(e) => handleNestedChange("other", key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Entry"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default Progress;