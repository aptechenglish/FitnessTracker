import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import Reveal from "../components/Reveal";
import { getDashboardStats } from "../services/dashboard";
import logo from "../assets/images/logo.png";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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

const CATEGORY_META = {
  strength: { icon: "workouts", label: "Strength" },
  cardio: { icon: "activity", label: "Cardio" },
  flexibility: { icon: "sparkles", label: "Flexibility" },
  balance: { icon: "scale", label: "Balance" },
  hiit: { icon: "flame", label: "HIIT" },
  other: { icon: "trophy", label: "Other" },
};

const MEAL_META = {
  breakfast: { icon: "coffee", label: "Breakfast" },
  lunch: { icon: "utensils", label: "Lunch" },
  dinner: { icon: "utensils", label: "Dinner" },
  snacks: { icon: "nutrition", label: "Snacks" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Sidebar>
    );
  }

  const s = data?.summary || {};
  const currentWeight = s.currentWeight;

  const cards = [
    {
      title: "Workouts",
      value: data?.summary.totalWorkouts ?? "—",
      change: `${data?.summary.weekWorkouts ?? 0} this week`,
      icon: "workouts",
    },
    {
      title: "Calories Burned",
      value: data?.summary.totalCaloriesBurned?.toLocaleString() ?? "—",
      change: `${data?.summary.weekCaloriesBurned?.toLocaleString() ?? 0} this week`,
      icon: "flame",
    },
    {
      title: "Calories Today",
      value: data?.summary.totalCaloriesIn?.toLocaleString() ?? "—",
      change: `${data?.summary.foodEntriesToday ?? 0} meals logged`,
      icon: "utensils",
    },
    {
      title: "Weight",
      value: currentWeight ? `${currentWeight} kg` : "—",
      change: data?.summary.weightChange
        ? `${data.summary.weightChange > 0 ? "+" : ""}${data.summary.weightChange} kg total`
        : "Track in Progress",
      icon: "scale",
    },
  ];

  const weightChart = {
    labels: (data?.weightProgress || []).map((w) =>
      new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Weight (kg)",
        data: (data?.weightProgress || []).map((w) => w.value),
        borderColor: "#e53935",
        backgroundColor: "rgba(229, 57, 53, 0.12)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#e53935",
        pointRadius: 5,
      },
    ],
  };

  const weeklyChart = {
    labels: (data?.weeklyActivity || []).map((d) => d.label),
    datasets: [
      {
        label: "Calories Burned",
        data: (data?.weeklyActivity || []).map((d) => d.calories),
        backgroundColor: (data?.weeklyActivity || []).map((_, i) => {
          const ctx = document.createElement("canvas").getContext("2d");
          const grad = ctx.createLinearGradient(0, 0, 0, 200);
          grad.addColorStop(0, "#e53935");
          grad.addColorStop(1, "#8e1e1e");
          return grad;
        }),
        hoverBackgroundColor: "#ff5252",
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 46,
      },
    ],
  };

  const nutritionDoughnut = {
    labels: ["Carbs", "Protein", "Fats"],
    datasets: [
      {
        data: [
          data?.summary.totalCarbs || 0,
          data?.summary.totalProtein || 0,
          data?.summary.totalFat || 0,
        ],
        backgroundColor: ["#e53935", "#c62828", "#8a8a8a"],
        borderWidth: 2,
      },
    ],
  };

  const goals = [
    { name: "Weight Loss Target", completed: data?.goals?.weightLoss ?? 0, icon: "scale" },
    { name: "Weekly Workouts", completed: data?.goals?.weeklyWorkouts ?? 0, icon: "workouts" },
    { name: "Daily Calorie Target", completed: data?.goals?.calorieTarget ?? 0, icon: "flame" },
    { name: "Monthly Active Days", completed: data?.goals?.activeDays ?? 0, icon: "calendar" },
  ];

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Reveal>
          <div className="vip-banner flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 relative z-10">
            <img src={logo} alt="Fitness Tracker Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_14px_rgba(229,57,53,0.5)]" />
            <div>
              <h1 className="text-2xl font-bold">
                Welcome, {user?.name?.split(" ")[0] || "Athlete"}
              </h1>
              <p className="text-sm text-white/75 mt-0.5">
                Here's your overall fitness overview
              </p>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <Link
              to="/workouts"
              className="vip-btn-primary px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5"
            >
              + Workout
            </Link>
            <Link
              to="/nutrition"
              className="bg-[#1a1a1a] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md border border-white/15"
            >
              + Food
            </Link>
          </div>
        </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <div
                className="stat-card rounded-2xl p-5 text-white transform hover:scale-105 transition duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon name={card.icon} className="w-7 h-7 text-[#e53935] shrink-0" />
                </div>
                <p className="text-xs text-gray-400">{card.title}</p>
                <p className="text-xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="vip-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="vip-card-title"><span className="vip-accent"><Icon name="activity" className="w-4 h-4" /></span>Weight Progress</h2>
              <Link to="/progress" className="text-sm text-[#e53935] hover:underline inline-flex items-center gap-1">
                View all <Icon name="arrowRight" className="w-4 h-4" />
              </Link>
            </div>
            {(data?.weightProgress || []).length > 1 ? (
              <div className="chart-container">
                <Line
                  data={weightChart}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
                    scales: { y: { beginAtZero: false } },
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Icon name="scale" className="w-10 h-10 mx-auto mb-3" />
                <p>Add weight entries to see progress</p>
              </div>
            )}
          </div>

          <div className="vip-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="vip-card-title"><span className="vip-accent"><Icon name="flame" className="w-4 h-4" /></span>Weekly Activity</h2>
              <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full">Calories burned</span>
            </div>
            <div className="chart-container">
            <Bar
              data={weeklyChart}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#1a1a1a",
                    titleColor: "#fff",
                    bodyColor: "#e53935",
                    borderColor: "#e53935",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255,255,255,0.06)" },
                    ticks: { color: "#8a8a8a" },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: "#8a8a8a" },
                  },
                },
              }}
            />
            </div>
          </div>
        </div>
        </Reveal>

        <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="vip-card p-6">
            <h2 className="vip-card-title mb-4"><span className="vip-accent"><Icon name="utensils" className="w-4 h-4" /></span>Daily Nutrition</h2>
            <div className="chart-container">
            <Doughnut
              data={nutritionDoughnut}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: "65%",
                plugins: { legend: { position: "bottom" } },
              }}
            />
            </div>
            <div className="mt-4 text-center bg-gray-800 border border-gray-700 rounded-xl p-4 text-white">
              <p className="text-3xl font-bold text-[#e53935]">{data?.summary.totalCaloriesIn?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-400">calories consumed today</p>
            </div>
          </div>

          <div className="vip-card p-6">
            <h2 className="vip-card-title mb-5"><span className="vip-accent"><Icon name="workouts" className="w-4 h-4" /></span>Recent Workouts</h2>
            {(data?.recentWorkouts || []).length > 0 ? (
              <div className="space-y-3">
                {data.recentWorkouts.map((w) => {
                  const meta = CATEGORY_META[w.category] || CATEGORY_META.other;
                  return (
                    <Link to="/workouts" key={w.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                      <Icon name={meta.icon} className="w-6 h-6 text-indigo-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{w.name}</p>
                        <p className="text-xs text-gray-500">
                          {meta.label} · {w.minutes ? `${w.minutes} min` : "—"} · {w.calories ? `${w.calories} cal` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{fmtDate(w.date)}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Icon name="workouts" className="w-10 h-10 mx-auto mb-3" />
                <p className="mb-3">No workouts yet</p>
                <Link to="/workouts" className="text-indigo-600 font-medium hover:underline text-sm">
                  Add your first workout
                </Link>
              </div>
            )}
          </div>

          <div className="vip-card p-6">
            <h2 className="vip-card-title mb-5"><span className="vip-accent"><Icon name="nutrition" className="w-4 h-4" /></span>Recent Nutrition</h2>
            {(data?.recentNutrition || []).length > 0 ? (
              <div className="space-y-3">
                {data.recentNutrition.map((f) => {
                  const meta = MEAL_META[f.mealType] || { icon: "utensils", label: "Meal" };
                  return (
                    <Link to="/nutrition" key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                      <Icon name={meta.icon} className="w-6 h-6 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{f.name}</p>
                        <p className="text-xs text-gray-500">{meta.label} · {f.calories} cal</p>
                      </div>
                      <span className="text-xs text-gray-400">{fmtDate(f.date)}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Icon name="utensils" className="w-10 h-10 mx-auto mb-3" />
                <p className="mb-3">No meals logged today</p>
                <Link to="/nutrition" className="text-emerald-600 font-medium hover:underline text-sm">
                  Log your first meal
                </Link>
              </div>
            )}
          </div>
        </div>
        </Reveal>

        <Reveal>
        <div className="vip-card p-6">
          <h2 className="vip-card-title mb-6"><span className="vip-accent"><Icon name="goals" className="w-4 h-4" /></span>Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.name} className="flex items-center gap-4">
                <Icon name={goal.icon} className="w-6 h-6 text-[#e53935] shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">{goal.name}</span>
                    <span className="text-sm font-semibold text-gray-500">{goal.completed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-[#c62828] to-[#e53935] shadow-[0_0_8px_rgba(229,57,53,0.5)] transition-all duration-700"
                      style={{ width: `${goal.completed}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </main>
    </Sidebar>
  );
};

export default Dashboard;