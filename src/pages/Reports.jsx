import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { downloadWorkoutsCSV, downloadNutritionCSV, downloadPDFReport } from "../services/reports";

const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const Reports = () => {
  const [period, setPeriod] = useState("month");
  const [exporting, setExporting] = useState(null);

  const runExport = async (key, fn) => {
    if (exporting) return;
    setExporting(key);
    try {
      await fn(period);
      toast.success("Download started!");
    } catch (error) {
      toast.error(error.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Sidebar>
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
          <p className="text-gray-600 mt-1">
            Generate your fitness data as downloadable PDF & CSV reports
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                  period === p.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Applies a date filter to PDF and CSV exports. "All Time" includes your entire history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5">
              <Icon name="reports" className="w-10 h-10 mb-2 text-white" />
              <h2 className="text-xl font-bold text-white">Fitness Progress Report</h2>
              <p className="text-indigo-100 text-sm mt-1">Detailed PDF summary</p>
            </div>
            <div className="p-6 space-y-2 text-sm text-gray-600">
              <p>✅ Summary (workouts, calories, weight)</p>
              <p>✅ Workout progress by category</p>
              <p>✅ Top exercises by volume</p>
              <p>✅ Nutrition summary by meal</p>
            </div>
            <div className="p-6 border-t flex justify-center">
              <button
                onClick={() => runExport("pdf", downloadPDFReport)}
                disabled={exporting === "pdf"}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {exporting === "pdf" ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-5">
              <Icon name="workouts" className="w-10 h-10 mb-2 text-white" />
              <h2 className="text-xl font-bold text-white">Workouts CSV</h2>
              <p className="text-emerald-100 text-sm mt-1">All workout entries</p>
            </div>
            <div className="p-6 space-y-2 text-sm text-gray-600">
              <p>✅ Date, name & category</p>
              <p>✅ Duration & calories burned</p>
              <p>✅ Exercises with volume</p>
              <p>✅ Tags & notes</p>
            </div>
            <div className="p-6 border-t flex justify-center">
              <button
                onClick={() => runExport("workouts", downloadWorkoutsCSV)}
                disabled={exporting === "workouts"}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {exporting === "workouts" ? "Exporting..." : "Export Workouts CSV"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-5">
              <Icon name="utensils" className="w-10 h-10 mb-2 text-white" />
              <h2 className="text-xl font-bold text-white">Nutrition CSV</h2>
              <p className="text-orange-100 text-sm mt-1">All food entries</p>
            </div>
            <div className="p-6 space-y-2 text-sm text-gray-600">
              <p>✅ Date & food name</p>
              <p>✅ Meal type & quantity</p>
              <p>✅ Calories & macros</p>
              <p>✅ Protein, carbs & fat</p>
            </div>
            <div className="p-6 border-t flex justify-center">
              <button
                onClick={() => runExport("nutrition", downloadNutritionCSV)}
                disabled={exporting === "nutrition"}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {exporting === "nutrition" ? "Exporting..." : "Export Nutrition CSV"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-sm text-indigo-800">
          <strong>💡 Tip:</strong> Use the period selector above to limit exported data.
          For the PDF report, weight comes from your latest logged measurement in the selected period.
        </div>
      </main>
    </Sidebar>
  );
};

export default Reports;