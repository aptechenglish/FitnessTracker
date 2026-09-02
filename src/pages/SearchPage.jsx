import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { searchAll } from "../services/search";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";

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

const GOAL_META = {
  lose_weight: { label: "Lose Weight", icon: "activity" },
  gain_muscle: { label: "Gain Muscle", icon: "workouts" },
  maintain: { label: "Maintain", icon: "goals" },
  improve_endurance: { label: "Endurance", icon: "progress" },
  general_fitness: { label: "General Fitness", icon: "sparkles" },
};

const Search = () => {
  const [type, setType] = useState("workouts");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [exercise, setExercise] = useState("");
  const [mealType, setMealType] = useState("");
  const [period, setPeriod] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { q: query, type };
      if (category) params.category = category;
      if (exercise) params.exercise = exercise;
      if (mealType) params.mealType = mealType;
      if (period) params.period = period;
      const res = await searchAll(params);
      setData(res.data);
      setSearched(true);
    } catch (error) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query, type, category, exercise, mealType, period]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch();
  };

  const workoutResults = data?.workouts || (type === "workouts" && data ? [] : null);
  const foodResults = data?.foods || (type === "nutrition" && data ? [] : null);
  const userResults = data?.users || (type === "users" && data ? [] : null);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const tabs = [
    { value: "workouts", icon: "workouts", label: "Workouts" },
    { value: "nutrition", icon: "utensils", label: "Nutrition" },
    { value: "users", icon: "users", label: "Users" },
  ];

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search & Filter</h1>
          <p className="text-gray-600 mt-1">Find workouts, nutrition records and users quickly</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-5">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-4 py-2 rounded-lg font-medium transition inline-flex items-center gap-1.5 ${
                  type === t.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon name={t.icon} className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  type === "workouts"
                    ? "Search workouts, exercises, tags..."
                    : type === "nutrition"
                    ? "Search foods..."
                    : "Search users by name or username..."
                }
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition inline-flex items-center gap-2"
              >
                <Icon name="search" className="w-4 h-4" /> Search
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {type === "workouts" && (
                <>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">All Categories</option>
                    {Object.entries(CATEGORY_META).map(([value, m]) => (
                      <option key={value} value={value}>{m.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    placeholder="Exercise (e.g. Bench Press)"
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              )}
              {type === "nutrition" && (
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">All Meals</option>
                  {Object.entries(MEAL_META).map(([value, m]) => (
                    <option key={value} value={value}>{m.label}</option>
                  ))}
                </select>
              )}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : searched && type === "workouts" ? (
          <WorkoutResults results={workoutResults} fmtDate={fmtDate} />
        ) : searched && type === "nutrition" ? (
          <FoodResults results={foodResults} fmtDate={fmtDate} />
        ) : searched && type === "users" ? (
          <UserResults results={userResults} />
        ) : null}
      </main>
    </Sidebar>
  );
};

const WorkoutResults = ({ results, fmtDate }) => {
  if (!results) return null;
  if (results.length === 0)
    return <EmptyState text="No workouts match your search" />;
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Workouts ({results.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {results.map((w) => {
          const cat = CATEGORY_META[w.category] || CATEGORY_META.other;
          return (
            <Link to="/workouts" key={w._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition block">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon name={cat.icon} className="w-8 h-8 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{w.workoutName}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                        {cat.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{fmtDate(w.date)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(w.exercises || []).slice(0, 4).map((ex, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {ex.name}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-sm text-gray-600">
                  {w.caloriesBurned > 0 && <span className="inline-flex items-center gap-1"><Icon name="flame" className="w-4 h-4 text-red-500" /> {w.caloriesBurned} cal</span>}
                  {w.durationMinutes > 0 && <span className="inline-flex items-center gap-1"><Icon name="reminders" className="w-4 h-4 text-gray-400" /> {w.durationMinutes} min</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const FoodResults = ({ results, fmtDate }) => {
  if (!results) return null;
  if (results.length === 0)
    return <EmptyState text="No nutrition records match your search" />;
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Nutrition Records ({results.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((f) => {
          const meal = MEAL_META[f.mealType] || { icon: "utensils", label: "Meal" };
          return (
            <Link to="/nutrition" key={f._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition block">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon name={meal.icon} className="w-8 h-8 text-gray-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.foodName}</h3>
                      {f.quantity && <p className="text-sm text-gray-500">{f.quantity}</p>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{fmtDate(f.date)}</span>
                </div>
                <div className="flex justify-center my-3">
                  <p className="text-3xl font-bold text-gray-800">{f.calories}</p>
                  <span className="text-gray-500 ml-1"> cal</span>
                </div>
                <div className="flex gap-2 justify-center">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded inline-flex items-center gap-1"><Icon name="workouts" className="w-3.5 h-3.5" /> {f.protein}g</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded inline-flex items-center gap-1"><Icon name="wheat" className="w-3.5 h-3.5" /> {f.carbs}g</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1"><Icon name="droplet" className="w-3.5 h-3.5" /> {f.fat}g</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const UserResults = ({ results }) => {
  if (!results) return null;
  if (results.length === 0)
    return <EmptyState text="No users match your search" />;
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Users ({results.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((u) => {
          const goal = GOAL_META[u.fitnessGoal] || GOAL_META.general_fitness;
          return (
            <div key={u._id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                {u.profilePicture ? (
                  <img src={u.profilePicture} alt={u.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                    {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{u.name}</h3>
                  <p className="text-sm text-gray-500">@{u.username}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1.5">
                  <Icon name={goal.icon} className="w-3.5 h-3.5" /> {goal.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
    <Icon name="search" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{text}</h3>
    <p className="text-gray-500">Try changing your search terms or filters</p>
  </div>
);

export default Search;