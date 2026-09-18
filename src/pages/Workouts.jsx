import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkouts, createWorkout, deleteWorkout, updateWorkout } from "../services/workouts";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { EXERCISE_DATABASE, EXERCISE_CATEGORIES, getEnrichedExercise } from "../data/exerciseDatabase";

const Workouts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("library"); // "library", "scheduler", "history"
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search for Library
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Exercise Detail Modal (Info & Guide)
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [guideTab, setGuideTab] = useState("angles"); // "angles" or "demo"

  // Quick Log / Schedule Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState("chest");
  const [logExercise, setLogExercise] = useState(null);
  const [logForm, setLogForm] = useState({
    title: "",
    category: "strength",
    duration: 30,
    caloriesBurned: 240,
    intensity: "moderate",
    sets: 3,
    reps: 10,
    weight: 20,
    date: new Date().toISOString().split("T")[0],
    scheduleType: "none",
    status: "completed",
    notes: "",
  });

  // Scheduler view mode
  const [scheduleView, setScheduleView] = useState("weekly"); // "daily", "weekly", "monthly"

  // Planner dropdown (category picker per day)
  const [planMenuDay, setPlanMenuDay] = useState(null); // day index or null
  const [planCat, setPlanCat] = useState(null); // selected category id

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWorkouts();
      setWorkouts(res.data);
    } catch (error) {
      toast.error("Failed to load workout logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // Open Log modal pre-filled with exercise data
  const handleOpenLog = (exercise) => {
    setLogExercise(exercise);
    setLogForm({
      title: exercise.name,
      category: exercise.category,
      duration: exercise.defaultDuration || 20,
      caloriesBurned: Math.round((exercise.caloriesPerMinute || 8) * (exercise.defaultDuration || 20)),
      intensity: "moderate",
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || 10,
      weight: exercise.defaultWeight || 0,
      date: new Date().toISOString().split("T")[0],
      scheduleType: "none",
      status: "completed",
      notes: `Target: ${exercise.targetMuscles.join(", ")}`,
    });
    setLogModalOpen(true);
  };

  // Get the next upcoming date (ISO) for a given weekday index (0=Mon ... 6=Sun)
  const getNextWeekday = (dayIndex) => {
    const today = new Date();
    const target = (dayIndex + 1) % 7;
    let diff = (target - today.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    const d = new Date(today);
    d.setDate(today.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  // Open full Scheduler Modal
  const handleOpenSchedulerModal = (dateStr = null) => {
    const targetDate = dateStr || new Date().toISOString().split("T")[0];
    const defaultEx = EXERCISE_DATABASE.find((e) => e.category === modalCategory) || EXERCISE_DATABASE[0];
    setLogExercise(defaultEx);
    setLogForm({
      title: defaultEx.name,
      category: defaultEx.category,
      duration: defaultEx.defaultDuration || 25,
      caloriesBurned: Math.round((defaultEx.caloriesPerMinute || 8) * (defaultEx.defaultDuration || 25)),
      intensity: "moderate",
      sets: defaultEx.defaultSets || 3,
      reps: defaultEx.defaultReps || 10,
      weight: defaultEx.defaultWeight || 20,
      date: targetDate,
      scheduleType: "none",
      status: targetDate === new Date().toISOString().split("T")[0] ? "completed" : "scheduled",
      notes: `Target: ${defaultEx.targetMuscles.join(", ")}`,
    });
    setSchedulerModalOpen(true);
  };

  const handleSelectModalExercise = (ex) => {
    setLogExercise(ex);
    setLogForm((prev) => ({
      ...prev,
      title: ex.name,
      category: ex.category,
      duration: ex.defaultDuration || 25,
      caloriesBurned: Math.round((ex.caloriesPerMinute || 8) * (ex.defaultDuration || 25)),
      sets: ex.defaultSets || 3,
      reps: ex.defaultReps || 10,
      weight: ex.defaultWeight || 0,
      notes: `Target: ${ex.targetMuscles.join(", ")}`,
    }));
  };

  // Plan a specific exercise from the planner dropdown on a given day
  const handlePlanExercise = (exercise, dayIndex, dayName) => {
    setLogExercise(exercise);
    setLogForm({
      title: exercise.name,
      category: exercise.category,
      duration: exercise.defaultDuration || 20,
      caloriesBurned: Math.round((exercise.caloriesPerMinute || 8) * (exercise.defaultDuration || 20)),
      intensity: "moderate",
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || 10,
      weight: exercise.defaultWeight || 0,
      date: getNextWeekday(dayIndex),
      scheduleType: scheduleView === "daily" ? "daily" : "weekly",
      status: "scheduled",
      notes: `Planned for ${dayName} • Target: ${exercise.targetMuscles.join(", ")}`,
    });
    setPlanMenuDay(null);
    setPlanCat(null);
    setLogModalOpen(true);
  };

  const closePlanMenu = () => {
    setPlanMenuDay(null);
    setPlanCat(null);
  };

  const handleDurationChange = (mins) => {
    const d = Number(mins) || 0;
    const rate = logExercise?.caloriesPerMinute || 8;
    setLogForm((f) => ({
      ...f,
      duration: d,
      caloriesBurned: Math.round(rate * d),
    }));
  };

  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    if (!logForm.title) {
      toast.error("Please enter a workout title");
      return;
    }

    try {
      const payload = {
        title: logForm.title,
        category: logForm.category,
        duration: Number(logForm.duration) || 30,
        caloriesBurned: Number(logForm.caloriesBurned) || 200,
        intensity: logForm.intensity,
        date: logForm.date,
        scheduleType: logForm.scheduleType,
        status: logForm.status,
        notes: logForm.notes,
        exercises: [
          {
            name: logForm.title,
            sets: Number(logForm.sets) || 3,
            reps: Number(logForm.reps) || 10,
            weight: Number(logForm.weight) || 0,
            image: logExercise?.image || "",
          },
        ],
      };

      await createWorkout(payload);
      // Dispatch app-wide event to update Dashboard, Analytics, Goals
      window.dispatchEvent(new CustomEvent("fitness_data_updated", { detail: { type: "workout", payload } }));
      toast.success(
        logForm.status === "scheduled" ? "Workout scheduled successfully!" : "Workout logged successfully!"
      );
      setLogModalOpen(false);
      setSchedulerModalOpen(false);
      loadWorkouts();
      if (logForm.status === "scheduled") {
        setActiveTab("scheduler");
      } else {
        setActiveTab("history");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save workout");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout record?")) return;
    try {
      await deleteWorkout(id);
      window.dispatchEvent(new CustomEvent("fitness_data_updated", { detail: { type: "workout" } }));
      toast.success("Workout removed");
      loadWorkouts();
    } catch (error) {
      toast.error("Failed to delete workout");
    }
  };

  const handleToggleStatus = async (w) => {
    const newStatus = w.status === "scheduled" ? "completed" : "scheduled";
    try {
      await updateWorkout(w._id, { status: newStatus });
      toast.success(newStatus === "completed" ? "Marked as completed!" : "Moved to scheduled");
      loadWorkouts();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Filter exercises
  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesCategory = selectedCategory === "all" || ex.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Scheduled workouts vs Completed workouts
  const scheduledList = workouts.filter((w) => w.status === "scheduled");
  const completedList = workouts.filter((w) => w.status !== "scheduled");

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="font-funky text-3xl font-extrabold text-slate-900">
              Workouts & <span className="text-red-600">Training</span>
            </h1>
            <p className="font-tech text-sm text-slate-500 mt-1">
              Explore exercise guides, build workouts, and schedule your weekly routine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLogExercise(null);
                setLogForm({
                  title: "Custom Workout",
                  category: "strength",
                  duration: 45,
                  caloriesBurned: 320,
                  intensity: "moderate",
                  sets: 3,
                  reps: 10,
                  weight: 20,
                  date: new Date().toISOString().split("T")[0],
                  scheduleType: "none",
                  status: "completed",
                  notes: "",
                });
                setLogModalOpen(true);
              }}
              className="vip-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              + Custom Workout
            </button>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-5 py-2.5 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "library"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon name="workouts" className="w-4 h-4" />
            Exercise Library ({EXERCISE_DATABASE.length})
          </button>
          <button
            onClick={() => setActiveTab("scheduler")}
            className={`px-5 py-2.5 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "scheduler"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon name="activity" className="w-4 h-4" />
            Workout Schedule ({scheduledList.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold transition-all duration-200 flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon name="trophy" className="w-4 h-4" />
            Workout History ({completedList.length})
          </button>
        </div>

        {/* TAB 1: EXERCISE LIBRARY */}
        {activeTab === "library" && (
          <div>
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
                {EXERCISE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-tech text-xs uppercase tracking-wider font-bold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="w-full md:w-72 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises, muscles..."
                  className="w-full px-4 py-2 pl-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Icon name="search" className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Exercise Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Exercise Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={ex.image}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg font-tech text-[10px] uppercase tracking-wider font-bold">
                      {ex.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 rounded-lg font-tech text-[10px] uppercase tracking-wider font-bold shadow-sm">
                      {ex.difficulty}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-funky font-bold text-base text-slate-900 mb-1 group-hover:text-red-600 transition">
                        {ex.name}
                      </h3>
                      <p className="font-tech text-xs text-slate-500 mb-3 flex items-center gap-1">
                        <span>🎯 {ex.targetMuscles.slice(0, 2).join(", ")}</span>
                      </p>

                      {/* Quick Meta */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-tech text-slate-600 mb-4">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Default</span>
                          <span className="font-bold text-slate-800">{ex.defaultSets} sets × {ex.defaultReps} reps</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Equipment</span>
                          <span className="font-bold text-slate-800 truncate block">{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedExercise(ex)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-tech font-bold text-xs uppercase tracking-wider transition"
                      >
                        Info & Guide
                      </button>
                      <button
                        onClick={() => handleOpenLog(ex)}
                        className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-tech font-bold text-xs uppercase tracking-wider transition shadow-sm"
                      >
                        + Log Workout
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WORKOUT SCHEDULER */}
        {activeTab === "scheduler" && (
          <div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-funky text-xl font-bold text-slate-900">
                    Workout <span className="text-red-600">Planner & Calendar</span>
                  </h2>
                  <p className="font-tech text-xs text-slate-500">
                    Schedule routines for Daily, Weekly, or Monthly training cycles
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenSchedulerModal(new Date().toISOString().split("T")[0])}
                    className="vip-btn-primary px-4 py-2 rounded-xl font-funky text-xs uppercase font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    + Log or Schedule Session
                  </button>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setScheduleView("daily")}
                      className={`px-3 py-1.5 rounded-lg font-tech text-xs uppercase font-bold transition ${
                        scheduleView === "daily" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setScheduleView("weekly")}
                      className={`px-3 py-1.5 rounded-lg font-tech text-xs uppercase font-bold transition ${
                        scheduleView === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setScheduleView("monthly")}
                      className={`px-3 py-1.5 rounded-lg font-tech text-xs uppercase font-bold transition ${
                        scheduleView === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Days Grid */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-6">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName, index) => {
                  const dayWorkouts = workouts.filter((w) => {
                    const d = new Date(w.date || w.scheduledDate);
                    return d.getDay() === (index + 1) % 7;
                  });

                  return (
                    <div
                      key={dayName}
                      className="relative p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 min-h-[140px] flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-funky font-bold text-xs uppercase text-slate-700">{dayName}</span>
                        <span className="text-[10px] font-tech text-slate-400 font-bold">{dayWorkouts.length} sessions</span>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        {dayWorkouts.slice(0, 3).map((w) => (
                          <div
                            key={w._id}
                            className={`p-1.5 rounded-lg text-[11px] font-tech font-bold truncate flex items-center justify-between ${
                              w.status === "scheduled" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            <span className="truncate">{w.title}</span>
                            <span className="text-[9px]">{w.duration}m</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleOpenSchedulerModal(getNextWeekday(index))}
                        className="mt-2 w-full py-1.5 text-[10px] font-tech font-bold uppercase text-red-600 hover:bg-red-50 rounded-lg border border-dashed border-red-200 transition text-center flex items-center justify-center gap-1"
                      >
                        + Add / Plan
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Scheduled Workouts List */}
              <div>
                <h3 className="font-funky font-bold text-sm uppercase text-slate-800 mb-3">
                  Upcoming Scheduled Workouts ({scheduledList.length})
                </h3>

                {scheduledList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="font-tech text-xs text-slate-500">No upcoming workouts scheduled yet.</p>
                    <button
                      onClick={() => setActiveTab("library")}
                      className="mt-2 text-xs font-bold text-red-600 hover:underline font-tech"
                    >
                      Browse Exercise Library to Schedule →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scheduledList.map((w) => (
                      <div key={w._id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-tech text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              {w.scheduleType || "Weekly"}
                            </span>
                            <span className="text-xs font-tech text-slate-500">{new Date(w.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-funky font-bold text-sm text-slate-900">{w.title}</h4>
                          <p className="font-tech text-xs text-slate-600 mt-1">
                            {w.duration} mins • ~{w.caloriesBurned} cal
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-200/60">
                          <button
                            onClick={() => handleToggleStatus(w)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-tech font-bold text-xs uppercase transition text-center"
                          >
                            ✓ Mark Done
                          </button>
                          <button
                            onClick={() => handleDelete(w._id)}
                            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKOUT HISTORY */}
        {activeTab === "history" && (
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-funky text-xl font-bold text-slate-900">
                    Logged <span className="text-red-600">Workout History</span>
                  </h2>
                  <p className="font-tech text-xs text-slate-500">
                    Your complete record of completed exercises and training sessions
                  </p>
                </div>
              </div>

              {completedList.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Icon name="workouts" className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-funky font-bold text-base text-slate-700">No workout records found</p>
                  <p className="font-tech text-xs text-slate-500 mt-1">Start by picking an exercise from the library!</p>
                  <button
                    onClick={() => setActiveTab("library")}
                    className="mt-4 vip-btn-primary px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Browse Exercise Library
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {completedList.map((w) => (
                    <div key={w._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-xl transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0">
                          <Icon name="workouts" className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-funky font-bold text-base text-slate-900">{w.title}</h4>
                          <div className="flex items-center gap-3 text-xs font-tech text-slate-500 mt-0.5">
                            <span className="capitalize">{w.category}</span>
                            <span>•</span>
                            <span>{w.duration} mins</span>
                            <span>•</span>
                            <span className="text-red-600 font-bold">{w.caloriesBurned} cal</span>
                            <span>•</span>
                            <span>{new Date(w.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(w._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-tech font-bold uppercase transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXERCISE DETAIL MODAL (INFO & GUIDE WITH ANGLES & GIF DEMO) */}
        {selectedExercise && (() => {
          const ex = getEnrichedExercise(selectedExercise);
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="absolute right-5 top-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition z-10"
                >
                  ✕
                </button>

                {/* Header Meta */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-900 text-white text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-md">
                    {ex.category}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-md">
                    {ex.difficulty}
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-md">
                    ~{ex.caloriesPerMinute} cal/min
                  </span>
                </div>

                <h2 className="font-funky font-black text-2xl text-slate-900 mb-1">
                  {ex.name}
                </h2>
                <p className="font-tech text-xs text-slate-500 mb-4">
                  <strong>Target Muscles:</strong> {ex.targetMuscles.join(", ")} • <strong>Equipment:</strong> {ex.equipment}
                </p>

                {/* GUIDE TAB SWITCHER */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-5">
                  <button
                    type="button"
                    onClick={() => setGuideTab("angles")}
                    className={`py-2 rounded-lg font-tech text-xs uppercase font-bold tracking-wider transition ${
                      guideTab === "angles"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    📐 Arm & Joint Angles (Form Anatomy)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideTab("demo")}
                    className={`py-2 rounded-lg font-tech text-xs uppercase font-bold tracking-wider transition ${
                      guideTab === "demo"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    🎬 Live Motion Demo (GIF / Video)
                  </button>
                </div>

                {/* TAB 1: ARM & JOINT FORM ANGLES */}
                {guideTab === "angles" && (
                  <div className="space-y-4">
                    {/* Visual Angles 4-Grid Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50/50 border border-red-100">
                        <span className="text-[10px] font-tech uppercase tracking-wider font-extrabold text-red-600 block mb-1">
                          🦾 Arm & Elbow Angle
                        </span>
                        <p className="font-funky text-sm font-bold text-slate-900 mb-1">
                          {ex.armAngle}
                        </p>
                        <p className="text-[11px] font-body text-slate-600">
                          Ensures optimal leverage on target muscles while protecting the rotator cuff and elbow joints.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100">
                        <span className="text-[10px] font-tech uppercase tracking-wider font-extrabold text-indigo-600 block mb-1">
                          ✋ Wrist & Grip Angle
                        </span>
                        <p className="font-funky text-sm font-bold text-slate-900 mb-1">
                          {ex.wristAngle}
                        </p>
                        <p className="text-[11px] font-body text-slate-600">
                          Directly stacks weight through the radius and ulna without wrist extension strain.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100">
                        <span className="text-[10px] font-tech uppercase tracking-wider font-extrabold text-emerald-600 block mb-1">
                          📐 Torso & Spine Angle
                        </span>
                        <p className="font-funky text-sm font-bold text-slate-900 mb-1">
                          {ex.torsoAngle}
                        </p>
                        <p className="text-[11px] font-body text-slate-600">
                          Keeps core braced and spinal discs neutrally aligned under external load.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100">
                        <span className="text-[10px] font-tech uppercase tracking-wider font-extrabold text-amber-700 block mb-1">
                          🦵 Lower Body & Knee Angle
                        </span>
                        <p className="font-funky text-sm font-bold text-slate-900 mb-1">
                          {ex.kneeAngle}
                        </p>
                        <p className="text-[11px] font-body text-slate-600">
                          Solid base of support distributing drive through mid-foot and stabilizing hips.
                        </p>
                      </div>
                    </div>

                    {/* Form Cues */}
                    <div>
                      <h3 className="font-funky font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                        Biomechanical Execution Cues
                      </h3>
                      <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {ex.formCues.map((cue, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs font-body text-slate-700">
                            <span className="text-red-600 font-bold">✓</span>
                            <span>{cue}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Mistakes Warning */}
                    <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
                      <p className="font-tech text-xs font-bold uppercase text-rose-700 mb-1.5 flex items-center gap-1.5">
                        ⚠️ Critical Form Mistakes to Avoid
                      </p>
                      <ul className="space-y-1 text-xs text-rose-900/90 font-body">
                        {ex.commonMistakes.map((mis, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-500">•</span>
                            <span>{mis}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE MOTION DEMO (GIF / VIDEO) */}
                {guideTab === "demo" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative aspect-video flex items-center justify-center">
                      <img
                        src={ex.gifUrl || ex.image}
                        alt={`${ex.name} Motion Demonstration`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.target.src !== ex.image) {
                            e.target.src = ex.image;
                          }
                        }}
                      />
                      {/* Live Motion Badge Overlay */}
                      <div className="absolute top-3 left-3 bg-red-600 text-white font-tech font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Live Motion Cadence
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white font-tech text-[10px] px-2.5 py-1 rounded-lg">
                        Tempo: 2s Down • 1s Pause • 1s Up
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="font-funky font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                        Step-by-Step Repetition Cadence
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 font-body leading-relaxed">
                        {ex.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {ex.tips && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-tech">
                        💡 <strong>Pro Tip:</strong> {ex.tips}
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Footer CTA */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-5">
                  <button
                    onClick={() => {
                      const toLog = selectedExercise;
                      setSelectedExercise(null);
                      handleOpenLog(toLog);
                    }}
                    className="flex-1 vip-btn-primary py-3 rounded-xl font-funky font-bold text-xs uppercase tracking-wider text-center"
                  >
                    + Log or Schedule This Exercise
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* FULL CATEGORY-BASED WORKOUT SCHEDULER & LOG MODAL */}
        {schedulerModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
              <button
                onClick={() => setSchedulerModalOpen(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition z-10"
              >
                ✕
              </button>

              <div className="mb-4">
                <h2 className="font-funky font-extrabold text-2xl text-slate-900">
                  {logForm.status === "scheduled" ? "Schedule Workout Routine" : "Log Today's Workout"}
                </h2>
                <p className="font-tech text-xs text-slate-500">
                  Select an exercise category, choose your workout routine, and save to your calendar
                </p>
              </div>

              {/* Status Toggle: Completed Today vs Scheduled Routine */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-5">
                <button
                  type="button"
                  onClick={() =>
                    setLogForm((f) => ({
                      ...f,
                      status: "completed",
                      scheduleType: "none",
                    }))
                  }
                  className={`py-2 rounded-lg font-tech text-xs uppercase font-bold tracking-wider transition ${
                    logForm.status === "completed"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  ✓ Completed (Log Workout)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLogForm((f) => ({
                      ...f,
                      status: "scheduled",
                      scheduleType: f.scheduleType === "none" ? "weekly" : f.scheduleType,
                    }))
                  }
                  className={`py-2 rounded-lg font-tech text-xs uppercase font-bold tracking-wider transition ${
                    logForm.status === "scheduled"
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  📅 Upcoming (Schedule Plan)
                </button>
              </div>

              {/* CATEGORY SELECTOR CAROUSEL */}
              <div className="mb-4">
                <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-2">
                  1. Choose Muscle Group / Category:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {EXERCISE_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setModalCategory(cat.id);
                        const firstInCat = EXERCISE_DATABASE.find((e) => e.category === cat.id);
                        if (firstInCat) handleSelectModalExercise(firstInCat);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-tech font-bold uppercase tracking-wider whitespace-nowrap transition flex items-center gap-1.5 border ${
                        modalCategory === cat.id
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Icon name={cat.icon} className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* WORKOUTS IN SELECTED CATEGORY */}
              <div className="mb-5">
                <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-2">
                  2. Select Workout from {EXERCISE_CATEGORIES.find((c) => c.id === modalCategory)?.label}:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {EXERCISE_DATABASE.filter((e) => e.category === modalCategory).map((ex) => {
                    const isSelected = logForm.title === ex.name;
                    return (
                      <div
                        key={ex.id}
                        onClick={() => handleSelectModalExercise(ex)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-red-50/70 border-red-500 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={ex.image}
                          alt={ex.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-funky font-bold text-xs text-slate-900 truncate">
                            {ex.name}
                          </p>
                          <p className="font-tech text-[10px] text-slate-500">
                            {ex.defaultSets} sets × {ex.defaultReps} reps • {ex.defaultDuration}m
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-red-600 font-bold text-xs shrink-0">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOMIZE & LOG FORM */}
              <form onSubmit={handleSaveWorkout} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Workout Title
                    </label>
                    <input
                      type="text"
                      value={logForm.title}
                      onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Workout Date
                    </label>
                    <input
                      type="date"
                      value={logForm.date}
                      onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 font-tech"
                      required
                    />
                  </div>
                </div>

                {/* Sets, Reps, Weight & Duration */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={logForm.sets}
                      onChange={(e) => setLogForm({ ...logForm, sets: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={logForm.reps}
                      onChange={(e) => setLogForm({ ...logForm, reps: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={logForm.weight}
                      onChange={(e) => setLogForm({ ...logForm, weight: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      value={logForm.duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Estimated Burn
                    </label>
                    <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-tech font-bold text-red-600 flex items-center justify-between">
                      <span>{logForm.caloriesBurned} Calories</span>
                      <span className="text-[10px] text-slate-400 uppercase">Auto-calculated</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Recurrence Routine
                    </label>
                    <select
                      value={logForm.scheduleType}
                      onChange={(e) => setLogForm({ ...logForm, scheduleType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-tech bg-white"
                    >
                      <option value="none">One-time Session</option>
                      <option value="daily">Daily Schedule</option>
                      <option value="weekly">Weekly Routine</option>
                      <option value="monthly">Monthly Cycle</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full vip-btn-primary py-3.5 rounded-xl font-funky font-extrabold text-xs uppercase tracking-wider mt-2 shadow-md"
                >
                  {logForm.status === "scheduled"
                    ? "✓ Save Routine to Workout Schedule"
                    : "✓ Log Completed Workout Session"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* QUICK LOG MODAL */}
        {logModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative">
              <button
                onClick={() => setLogModalOpen(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                ✕
              </button>

              <h2 className="font-funky font-extrabold text-xl text-slate-900 mb-1">
                {logForm.status === "scheduled" ? "Schedule Workout" : "Log Completed Workout"}
              </h2>
              <p className="font-tech text-xs text-slate-500 mb-6">
                Adjust sets, reps, weight and duration — calories are calculated automatically
              </p>

              <form onSubmit={handleSaveWorkout} className="space-y-4">
                <div>
                  <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                    Workout / Exercise Title
                  </label>
                  <input
                    type="text"
                    value={logForm.title}
                    onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={logForm.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 font-tech"
                    required
                  />
                </div>

                {/* Sets, Reps, Weight */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      value={logForm.sets}
                      onChange={(e) => setLogForm({ ...logForm, sets: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Reps per Set
                    </label>
                    <input
                      type="number"
                      value={logForm.reps}
                      onChange={(e) => setLogForm({ ...logForm, reps: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={logForm.weight}
                      onChange={(e) => setLogForm({ ...logForm, weight: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-tech bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Workout Date
                    </label>
                    <input
                      type="date"
                      value={logForm.date}
                      onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-tech"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Schedule Routine
                    </label>
                    <select
                      value={logForm.scheduleType}
                      onChange={(e) =>
                        setLogForm({
                          ...logForm,
                          scheduleType: e.target.value,
                          status: e.target.value === "none" ? "completed" : "scheduled",
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-tech bg-white"
                    >
                      <option value="none">One-time Workout</option>
                      <option value="daily">Daily Schedule</option>
                      <option value="weekly">Weekly Schedule</option>
                      <option value="monthly">Monthly Schedule</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full vip-btn-primary py-3.5 rounded-xl font-funky font-extrabold text-xs uppercase tracking-wider mt-4"
                >
                  {logForm.status === "scheduled" ? "Save to Schedule" : "Log Workout Session"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </Sidebar>
  );
};

export default Workouts;
