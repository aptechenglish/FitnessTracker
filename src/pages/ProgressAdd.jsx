import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { createMeasurement } from "../services/measurements";

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

const BodyMeasurements = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "armsLeft", label: "Arms (Left)" },
  { key: "armsRight", label: "Arms (Right)" },
  { key: "thighsLeft", label: "Thighs (Left)" },
  { key: "thighsRight", label: "Thighs (Right)" },
  { key: "neck", label: "Neck" },
  { key: "calvesLeft", label: "Calves (Left)" },
  { key: "calvesRight", label: "Calves (Right)" },
];

const Lifts = [
  { key: "benchPress", label: "Bench Press" },
  { key: "deadlift", label: "Deadlift" },
  { key: "squat", label: "Squat" },
  { key: "overheadPress", label: "Overhead Press" },
];

const ProgressAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyMeasurement());
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value === "" ? "" : Number(value) || 0 });
  };

  const handleNestedChange = (group, field, value) => {
    setForm({
      ...form,
      [group]: { ...form[group], [field]: value === "" ? "" : Number(value) || 0 },
    });
  };

  const numberInput = (group, field, placeholder) => (
    <input
      type="number"
      value={form[group][field]}
      onChange={(e) => handleNestedChange(group, field, e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMeasurement({ ...form, date: new Date(form.date).toISOString() });
      toast.success("Progress entry added!");
      navigate("/progress");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add entry");
      setSaving(false);
    }
  };

  const label = (t) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{t}</label>
  );

  return (
    <Sidebar>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/progress" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
            <Icon name="arrowLeft" className="w-4 h-4" /> Back to Progress
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Add Progress Entry</h1>
          <p className="text-gray-600 mt-1">Record body stats, lifting and running data</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* General */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">😊 General</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {label("Date")}
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  {label("Weight (kg)")}
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="e.g. 75"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  {label("Body Fat (%)")}
                  <input
                    type="number"
                    name="bodyFat"
                    value={form.bodyFat}
                    onChange={handleChange}
                    placeholder="e.g. 18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </section>

            {/* Body measurements */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Icon name="sparkles" className="w-5 h-5 text-gray-500" /> Body Measurements (cm)</h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {BodyMeasurements.map((m) => (
                  <div key={m.key}>
                    {label(m.label)}
                    {numberInput("measurements", m.key, "0")}
                  </div>
                ))}
              </div>
            </section>

            {/* Running */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Icon name="activity" className="w-5 h-5 text-gray-500" /> Running</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {label("Distance (km)")}
                  {numberInput("running", "distance", "0")}
                </div>
                <div>
                  {label("Time (min)")}
                  {numberInput("running", "timeMinutes", "0")}
                </div>
                <div>
                  {label("Pace per km")}
                  {numberInput("running", "pacePerKm", "0")}
                </div>
              </div>
            </section>

            {/* Lifting */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Icon name="workouts" className="w-5 h-5 text-gray-500" /> Lifting (kg)</h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Lifts.map((l) => (
                  <div key={l.key}>
                    {label(l.label)}
                    {numberInput("lifting", l.key, "0")}
                  </div>
                ))}
              </div>
            </section>

            {/* Other */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Icon name="analytics" className="w-5 h-5 text-gray-500" /> Other</h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  {label("Daily Steps")}
                  {numberInput("other", "dailySteps", "0")}
                </div>
                <div>
                  {label("Sleep (hrs)")}
                  {numberInput("other", "sleepHours", "0")}
                </div>
                <div>
                  {label("Calories Burned")}
                  {numberInput("other", "caloriesBurned", "0")}
                </div>
                <div>
                  {label("Rest Heart Rate")}
                  {numberInput("other", "restHeartRate", "0")}
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Icon name="reports" className="w-5 h-5 text-gray-500" /> Notes</h2>
              </div>
              <div className="p-6">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any notes about this entry..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>
            </section>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Entry"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/progress")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </main>
    </Sidebar>
  );
};

export default ProgressAdd;