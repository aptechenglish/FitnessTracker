import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getWorkouts,
  deleteWorkout,
} from "../services/workouts";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "strength", label: "Strength", color: "bg-red-100 text-red-700", icon: "workouts" },
  { value: "cardio", label: "Cardio", color: "bg-green-100 text-green-700", icon: "activity" },
  { value: "flexibility", label: "Flexibility", color: "bg-purple-100 text-purple-700", icon: "sparkles" },
  { value: "balance", label: "Balance", color: "bg-blue-100 text-blue-700", icon: "scale" },
  { value: "hiit", label: "HIIT", color: "bg-orange-100 text-orange-700", icon: "flame" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-700", icon: "trophy" },
];

const getCategoryInfo = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[5];

const Workouts = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory !== "all") params.category = filterCategory;
      if (search) params.search = search;
      const res = await getWorkouts(params);
      setWorkouts(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, search]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const openAdd = () => navigate("/workouts/create");
  const openDetail = (id) => navigate(`/workouts/${id}`);
  const openEdit = (id) => navigate(`/workouts/${id}/edit`);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await deleteWorkout(id);
      toast.success("Workout deleted");
      loadWorkouts();
    } catch (error) {
      toast.error("Failed to delete workout");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
            <p className="text-gray-600 mt-1">Track your strength, cardio, and flexibility sessions</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Workout
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workouts, exercises, tags..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Icon name="workouts" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No workouts yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your fitness journey by adding your first workout!</p>
            <button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Add Your First Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workouts.map((workout) => {
              const cat = getCategoryInfo(workout.category);
              return (
                <div key={workout._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon name={cat.icon} className="w-8 h-8 text-gray-500 shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{workout.workoutName}</h3>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cat.color}`}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(workout.date)}</span>
                    </div>

                    <div className="space-y-2 mt-4">
                      {workout.exercises.map((ex, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-gray-800">{ex.name}</span>
                            <div className="flex gap-3 text-xs text-gray-600">
                              {ex.sets > 0 && <span>{ex.sets} sets</span>}
                              {ex.reps > 0 && <span>{ex.reps} reps</span>}
                              {ex.weight > 0 && <span>{ex.weight} kg</span>}
                              {ex.duration > 0 && <span>{ex.duration} min</span>}
                              {ex.distance > 0 && <span>{ex.distance} km</span>}
                            </div>
                          </div>
                          {ex.notes && <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>}
                        </div>
                      ))}
                    </div>

                    {workout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {workout.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 mt-4 text-sm text-gray-600">
                      {workout.caloriesBurned > 0 && <span className="inline-flex items-center gap-1"><Icon name="flame" className="w-4 h-4 text-red-500" /> {workout.caloriesBurned} cal</span>}
                      {workout.durationMinutes > 0 && <span className="inline-flex items-center gap-1"><Icon name="reminders" className="w-4 h-4 text-gray-400" /> {workout.durationMinutes} min</span>}
                    </div>

                    <div className="flex gap-2.5 mt-5 border-t pt-4">
                      <button
                        onClick={() => openDetail(workout._id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition shadow-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEdit(workout._id)}
                        className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm font-medium transition shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workout._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </Sidebar>
  );
};

export default Workouts;
