import { useState, useEffect } from "react";
import {
  Line,
  Bar,
  Doughnut,
  Pie,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { getWorkoutAnalytics, getNutritionAnalytics } from "../services/analytics";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import Reveal from "../components/Reveal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

ChartJS.defaults.color = "#8a8a8a";
ChartJS.defaults.borderColor = "rgba(255, 255, 255, 0.1)";

const fmtLabel = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

const Analytics = () => {
  const [workoutPeriod, setWorkoutPeriod] = useState("30");
  const [nutritionPeriod, setNutritionPeriod] = useState("7");
  const [workoutData, setWorkoutData] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);

  useEffect(() => {
    getWorkoutAnalytics(workoutPeriod).then((res) => setWorkoutData(res.data)).catch(() => {});
  }, [workoutPeriod]);

  useEffect(() => {
    getNutritionAnalytics(nutritionPeriod).then((res) => setNutritionData(res.data)).catch(() => {});
  }, [nutritionPeriod]);

  const itemColor = (palette) => palette[Math.floor(Math.random() * palette.length)];

  const liftsOnly = workoutData?.liftProgress?.filter((l) => l.points.length > 0) || [];

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Visualization</h1>
          <p className="text-gray-600 mt-1">Workout & Nutrition analytics with charts</p>
        </div>

        <Reveal>
        <div className="vip-banner flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2"><Icon name="workouts" className="w-5 h-5" /> Workout Analytics</h2>
            <p className="text-white/80 text-sm mt-1">
              {workoutData?.totals?.totalWorkouts || 0} workouts ·{" "}
              {workoutData?.totals?.totalCaloriesBurned || 0} calories burned in selected period
            </p>
          </div>
          <div className="flex gap-2 relative z-10">
            {[7, 30, 90].map((p) => (
              <button
                key={p}
                onClick={() => setWorkoutPeriod(String(p))}
                className={`vip-chip ${workoutPeriod === String(p) ? "vip-chip-active" : ""}`}
              >
                {p} days
              </button>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="workouts" className="w-4 h-4" /></span>Weight Lifting Progress</h3>
            {liftsOnly.length > 0 ? (
              <div className="h-64 sm:h-80 w-full min-w-0">
                <Line
                  data={{
                    labels: (liftsOnly[0].points || []).map((p) =>
                      new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    ),
                    datasets: liftsOnly.map((lift) => ({
                      label: lift.label,
                      data: lift.points.map((p) => p.value),
                      borderColor: ["#e53935", "#c62828", "#8a8a8a", "#b71c1c"][liftsOnly.indexOf(lift) % 4],
                      backgroundColor: "transparent",
                      tension: 0.3,
                      pointRadius: 4,
                    })),
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
                    scales: { y: { beginAtZero: true, title: { display: true, text: "kg" } } },
                  }}
                />
              </div>
            ) : (
              <EmptyState icon="workouts" text="Record lifting measurements to see progress" />
            )}
          </div>

          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="flame" className="w-4 h-4" /></span>Workout Frequency</h3>
            <div className="h-64 sm:h-80 w-full min-w-0">
              <Bar
                data={{
                  labels: (workoutData?.frequencyOverTime?.labels || []).map(fmtLabel),
                  datasets: [
                    {
                      label: "Workouts",
                      data: workoutData?.frequencyOverTime?.data || [],
                      backgroundColor: "#e53935",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { ticks: { maxTicksLimit: 15 } } },
                }}
              />
            </div>
          </div>

          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="activity" className="w-4 h-4" /></span>Calories Burned Over Time</h3>
            <div className="h-64 sm:h-80 w-full min-w-0">
              <Line
                data={{
                  labels: (workoutData?.caloriesOverTime?.labels || []).map(fmtLabel),
                  datasets: [
                    {
                      label: "Calories Burned",
                      data: workoutData?.caloriesOverTime?.data || [],
                      borderColor: "#e53935",
                      backgroundColor: "rgba(229,57,53,0.12)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true }, x: { ticks: { maxTicksLimit: 15 } } },
                }}
              />
            </div>
          </div>

          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="sparkles" className="w-4 h-4" /></span>Workout Categories</h3>
            <div className="max-h-64 sm:max-h-80 w-full min-w-0 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: Object.keys(workoutData?.categoryBreakdown || {}),
                  datasets: [
                    {
                      data: Object.values(workoutData?.categoryBreakdown || {}),
                      backgroundColor: ["#e53935", "#c62828", "#8a8a8a", "#b71c1c", "#6b6b6b", "#f05452"],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{ responsive: true, cutout: "60%", plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </div>
        </div>
        </Reveal>

        {workoutData?.exerciseHistory?.length > 0 && (
          <Reveal>
          <div className="vip-card p-6 mb-10">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="workouts" className="w-4 h-4" /></span>Exercise History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800/60">
                  <tr className="text-sm text-gray-400">
                    <th className="px-4 py-3 font-medium">Exercise</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Sets</th>
                    <th className="px-4 py-3 font-medium">Reps</th>
                    <th className="px-4 py-3 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutData.exerciseHistory
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 15)
                    .map((ex, i) => (
                      <tr key={i} className="border-t hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-100">{ex.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(ex.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">{ex.sets}</td>
                        <td className="px-4 py-3 text-sm text-gray-200">{ex.reps}</td>
                        <td className="px-4 py-3 text-sm text-gray-200">{ex.weight > 0 ? `${ex.weight} kg` : "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          </Reveal>
        )}

        <Reveal>
        <div className="vip-banner flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2"><Icon name="utensils" className="w-5 h-5" /> Nutrition Analytics</h2>
            <p className="text-white/80 text-sm mt-1">
              {nutritionData?.totalEntries || 0} entries · avg {nutritionData?.avgCalories || 0} cal/meal
            </p>
          </div>
          <div className="flex gap-2 relative z-10">
            {[7, 30, 90].map((p) => (
              <button
                key={p}
                onClick={() => setNutritionPeriod(String(p))}
                className={`vip-chip ${nutritionPeriod === String(p) ? "vip-chip-active" : ""}`}
              >
                {p} days
              </button>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="flame" className="w-4 h-4" /></span>Daily Calories</h3>
            <div className="h-64 sm:h-80 w-full min-w-0">
              <Bar
                data={{
                  labels: (nutritionData?.caloriesTrend?.labels || []).map(fmtLabel),
                  datasets: [
                    {
                      label: "Calories",
                      data: nutritionData?.caloriesTrend?.data || [],
                      backgroundColor: "rgba(229,57,53,0.8)",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true }, x: { ticks: { maxTicksLimit: 15 } } },
                }}
              />
            </div>
          </div>

          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="nutrition" className="w-4 h-4" /></span>Macro Consumption Trend (g)</h3>
            <div className="h-64 sm:h-80 w-full min-w-0">
              <Line
                data={{
                  labels: (nutritionData?.macroTrend?.labels || []).map(fmtLabel),
                  datasets: [
                    { label: "Protein", data: nutritionData?.macroTrend?.protein || [], borderColor: "#e53935", backgroundColor: "transparent", tension: 0.3 },
                    { label: "Carbs", data: nutritionData?.macroTrend?.carbs || [], borderColor: "#c62828", backgroundColor: "transparent", tension: 0.3 },
                    { label: "Fat", data: nutritionData?.macroTrend?.fat || [], borderColor: "#8a8a8a", backgroundColor: "transparent", tension: 0.3 },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true }, x: { ticks: { maxTicksLimit: 15 } } },
                }}
              />
            </div>
          </div>

          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="scale" className="w-4 h-4" /></span>Macro Totals (selected period)</h3>
            <div className="max-h-64 sm:max-h-80 w-full min-w-0 flex items-center justify-center">
              <Pie
                data={{
                  labels: ["Protein", "Carbs", "Fat"],
                  datasets: [
                    {
                      data: [
                        nutritionData?.macroTotals?.protein || 0,
                        nutritionData?.macroTotals?.carbs || 0,
                        nutritionData?.macroTotals?.fat || 0,
                      ],
                      backgroundColor: ["#e53935", "#c62828", "#8a8a8a"],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </div>

          <div className="vip-card p-6">
            <h3 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="utensils" className="w-4 h-4" /></span>Meals by Type</h3>
            <div className="max-h-64 sm:max-h-80 w-full min-w-0 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: Object.keys(nutritionData?.mealTypeBreakdown || {}).map(
                    (k) => ({ breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" }[k] || k)
                  ),
                  datasets: [
                    {
                      data: Object.values(nutritionData?.mealTypeBreakdown || {}),
                      backgroundColor: ["#e53935", "#c62828", "#8a8a8a", "#b71c1c"],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{ responsive: true, cutout: "60%", plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </div>
        </div>
        </Reveal>
      </main>
    </Sidebar>
  );
};

const EmptyState = ({ icon, text }) => (
  <div className="text-center py-14 text-gray-400">
    <Icon name={icon} className="w-14 h-14 mx-auto mb-3" />
    <p>{text}</p>
  </div>
);

export default Analytics;
