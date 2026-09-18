import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../services/goals";
import { updateProfile } from "../services/auth";

const TYPE_META = {
  weight: { icon: "scale", label: "Weight", color: "bg-rose-100 text-rose-700" },
  strength: { icon: "workouts", label: "Strength", color: "bg-indigo-100 text-indigo-700" },
  cardio: { icon: "heart", label: "Cardio", color: "bg-red-100 text-red-700" },
  running: { icon: "activity", label: "Running", color: "bg-orange-100 text-orange-700" },
  nutrition: { icon: "utensils", label: "Nutrition", color: "bg-emerald-100 text-emerald-700" },
  habit: { icon: "calendar", label: "Habit", color: "bg-purple-100 text-purple-700" },
  other: { icon: "goals", label: "Goal", color: "bg-blue-100 text-blue-700" },
};

const STATUS_STYLE = {
  active: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  achieved: "bg-green-100 text-green-700",
  archived: "bg-gray-200 text-gray-600",
};

const emptyGoal = () => ({
  title: "",
  type: "weight",
  target: "",
  unit: "kg",
  currentValue: "",
  targetDate: "",
  notes: "",
});

// Automated Nutrition & Workout Plan Generator
export const generatePlanFromTargetWeight = (targetWeightNum, currentWeightNum, user) => {
  const current = Number(currentWeightNum) || Number(user?.weight) || 75;
  const target = Number(targetWeightNum);
  if (!target || target <= 0) return null;

  const diff = target - current;
  const isLosing = diff < 0;
  const isGaining = diff > 0;
  const absDiff = Math.abs(diff);

  // Maintenance calories calculation
  const baseTDEE = Math.round(current * 31);
  let dailyCalories = baseTDEE;
  let deficitOrSurplus = 0;
  let weeklyRateKg = 0.5;

  if (isLosing) {
    deficitOrSurplus = -500;
    dailyCalories = Math.max(1350, baseTDEE - 500);
    weeklyRateKg = 0.5;
  } else if (isGaining) {
    deficitOrSurplus = 300;
    dailyCalories = baseTDEE + 300;
    weeklyRateKg = 0.25;
  }

  // Macro distribution
  const proteinGrams = Math.round(current * 2.0); // 2g per kg
  const fatGrams = Math.round((dailyCalories * 0.25) / 9);
  const carbGrams = Math.max(50, Math.round((dailyCalories - (proteinGrams * 4 + fatGrams * 9)) / 4));

  const estimatedWeeks = Math.max(1, Math.ceil(absDiff / weeklyRateKg));

  const workoutPlan = isLosing
    ? {
        title: "Fat Loss & Metabolic Conditioning Split",
        frequency: "4 - 5 Days / Week",
        weeklyBurnTarget: 2200,
        routines: [
          { day: "Day 1", name: "Upper Body Push & Incline Cardio", burn: "450 cal", desc: "Bench press, incline dumbbells, pushups + 15m incline walk" },
          { day: "Day 2", name: "Legs, Glutes & Core Focus", burn: "520 cal", desc: "Squats, lunges, leg press + plank holds & leg raises" },
          { day: "Day 3", name: "Active Recovery & Mobility", burn: "150 cal", desc: "6,000 steps brisk walk & full body stretching" },
          { day: "Day 4", name: "Upper Body Pull & Rowing HIIT", burn: "480 cal", desc: "Deadlifts, bent-over rows, pullups + 15m rowing" },
          { day: "Day 5", name: "Full Body Functional Burn", burn: "600 cal", desc: "Burpees, kettlebell swings, jump rope intervals" },
        ],
      }
    : {
        title: "Lean Muscle Hypertrophy & Strength Split",
        frequency: "4 Days / Week",
        weeklyBurnTarget: 1600,
        routines: [
          { day: "Day 1", name: "Chest & Triceps Power", burn: "380 cal", desc: "Heavy flat barbell press, dips, skull crushers" },
          { day: "Day 2", name: "Back & Biceps Volume", burn: "400 cal", desc: "Barbell rows, lat pulldowns, hammer curls" },
          { day: "Day 3", name: "Rest & High-Protein Loading", burn: "100 cal", desc: "Rest day with clean surplus nutrition" },
          { day: "Day 4", name: "Quads, Hamstrings & Calves", burn: "460 cal", desc: "Back squats, Romanian deadlifts, calf raises" },
          { day: "Day 5", name: "Shoulders & Core Stability", burn: "360 cal", desc: "Overhead barbell press, lateral raises, ab wheel" },
        ],
      };

  return {
    diff,
    isLosing,
    isGaining,
    absDiff,
    current,
    target,
    baseTDEE,
    dailyCalories,
    deficitOrSurplus,
    proteinGrams,
    carbGrams,
    fatGrams,
    estimatedWeeks,
    workoutPlan,
  };
};

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyGoal());
  const [saving, setSaving] = useState(false);
  const [syncToProfile, setSyncToProfile] = useState(true);

  const load = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await getGoals(status === "all" ? undefined : status);
      setGoals(res.data);
    } catch (error) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
    const handleUpdate = () => load(filter);
    window.addEventListener("fitness_data_updated", handleUpdate);
    return () => window.removeEventListener("fitness_data_updated", handleUpdate);
  }, [load, filter]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...emptyGoal(),
      currentValue: user?.weight ? String(user.weight) : "75",
      target: user?.targetWeight ? String(user.targetWeight) : "",
    });
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditing(g._id);
    setForm({
      title: g.title,
      type: g.type,
      target: g.target,
      unit: g.unit,
      currentValue: g.currentValue,
      targetDate: g.targetDate ? g.targetDate.slice(0, 10) : "",
      notes: g.notes || "",
    });
    setShowModal(true);
  };

  // Live generated plan
  const autoPlan =
    form.type === "weight" && form.target
      ? generatePlanFromTargetWeight(form.target, form.currentValue, user)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Goal title is required");
      return;
    }
    setSaving(true);
    try {
      let finalNotes = form.notes;
      if (autoPlan) {
        const planSummary = `\n[Auto-Plan: ${autoPlan.dailyCalories} kcal/day (${autoPlan.deficitOrSurplus > 0 ? "+" : ""}${autoPlan.deficitOrSurplus} kcal) | Macros: ${autoPlan.proteinGrams}g P, ${autoPlan.carbGrams}g C, ${autoPlan.fatGrams}g F | Routine: ${autoPlan.workoutPlan.title}]`;
        if (!finalNotes.includes("[Auto-Plan:")) {
          finalNotes = (finalNotes + planSummary).trim();
        }
      }

      const goalPayload = {
        ...form,
        notes: finalNotes,
      };

      if (editing) {
        await updateGoal(editing, goalPayload);
        toast.success("Goal updated!");
      } else {
        await createGoal(goalPayload);
        toast.success("Goal created!");
      }

      // Sync recommended calorie target & target weight to profile if requested
      if (syncToProfile && autoPlan) {
        try {
          await updateProfile({
            targetCalories: autoPlan.dailyCalories,
            targetWeight: Number(form.target),
          });
          toast.success(`Daily Nutrition Goal set to ${autoPlan.dailyCalories} kcal!`);
        } catch (profErr) {
          console.error("Profile sync error:", profErr);
        }
      }

      // Dispatch event to refresh Dashboard and other pages
      window.dispatchEvent(
        new CustomEvent("fitness_data_updated", {
          detail: { type: "goal", plan: autoPlan },
        })
      );

      setShowModal(false);
      load(filter);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      toast.success("Goal deleted");
      load(filter);
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const percent = (g) => {
    if (!g.target || g.target <= 0) return 0;
    return Math.min(100, Math.round((g.currentValue / g.target) * 100));
  };

  return (
    <Sidebar>
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
            <p className="text-gray-600 mt-1">Set and track your fitness goals</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
          >
            + Add Goal
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "active", "in_progress", "achieved", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                filter === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "All Goals" : s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Icon name="goals" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-6">
              Set your first fitness goal to start tracking your progress
            </p>
            <button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((g) => {
              const meta = TYPE_META[g.type] || TYPE_META.other;
              const pct = percent(g);
              return (
                <div key={g._id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${meta.color}`}>
                      <Icon name={meta.icon} className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[g.status] || STATUS_STYLE.active}`}>
                      {g.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{g.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {meta.label}
                    {g.unit ? ` · ${g.unit}` : ""}
                  </p>
                  {g.notes && <p className="text-sm text-gray-600 mt-2">{g.notes}</p>}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">
                        {g.status === "achieved" ? "Achieved" : "Progress"}
                      </span>
                      <span className="font-semibold text-gray-800">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          g.status === "achieved" ? "bg-green-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Current: <strong className="text-gray-800">{g.currentValue || 0}</strong>
                      </span>
                      <span>
                        Target: <strong className="text-gray-800">{g.target || 0}</strong>
                      </span>
                    </div>
                    {g.targetDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        By: {new Date(g.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4 border-t pt-4">
                    <button
                      onClick={() => openEdit(g)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Update Goal" : "Add Goal"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:text-gray-200">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Lose 5 kg by December"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(TYPE_META).map(([value, m]) => (
                      <option key={value} value={value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="kg, km, min..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                  <input
                    type="number"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={form.currentValue}
                    onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* AUTOMATICALLY GENERATED NUTRITION & WORKOUT PLAN */}
              {autoPlan && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-funky font-bold text-xs uppercase text-indigo-700 flex items-center gap-1.5">
                      ⚡ Automated Nutrition & Workout Plan
                    </span>
                    <span
                      className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded-full ${
                        autoPlan.isLosing ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {autoPlan.isLosing
                        ? `Weight Loss: -${autoPlan.absDiff.toFixed(1)} kg`
                        : `Muscle Gain: +${autoPlan.absDiff.toFixed(1)} kg`}
                    </span>
                  </div>

                  {/* Daily Calorie Intake & Macros */}
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-tech text-gray-400 block">
                          Recommended Daily Intake
                        </span>
                        <span className="text-xl font-funky font-extrabold text-indigo-600">
                          {autoPlan.dailyCalories.toLocaleString()}{" "}
                          <span className="text-xs font-tech font-normal text-gray-500">kcal / day</span>
                        </span>
                      </div>
                      <span className="text-[11px] font-tech font-bold text-gray-600">
                        {autoPlan.deficitOrSurplus < 0
                          ? "500 kcal Deficit (Fat Loss)"
                          : "300 kcal Surplus (Hypertrophy)"}
                      </span>
                    </div>

                    {/* Macro distribution */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-tech pt-2 border-t border-gray-100">
                      <div className="p-1.5 bg-indigo-50/70 rounded">
                        <span className="text-[10px] text-indigo-600 block uppercase font-bold">Protein</span>
                        <strong className="text-indigo-900">{autoPlan.proteinGrams}g</strong>
                      </div>
                      <div className="p-1.5 bg-amber-50/70 rounded">
                        <span className="text-[10px] text-amber-600 block uppercase font-bold">Carbs</span>
                        <strong className="text-amber-900">{autoPlan.carbGrams}g</strong>
                      </div>
                      <div className="p-1.5 bg-rose-50/70 rounded">
                        <span className="text-[10px] text-rose-600 block uppercase font-bold">Fats</span>
                        <strong className="text-rose-900">{autoPlan.fatGrams}g</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tailored Workout Routine */}
                  <div className="p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-800">
                        🏋️ {autoPlan.workoutPlan.title}
                      </span>
                      <span className="text-[10px] font-tech text-gray-500">
                        {autoPlan.workoutPlan.frequency}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {autoPlan.workoutPlan.routines.map((r, i) => (
                        <div
                          key={i}
                          className="text-xs p-1.5 rounded bg-gray-50 flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-gray-800 mr-1.5">{r.day}:</span>
                            <span className="text-gray-700">{r.name}</span>
                            <span className="text-[10px] text-gray-500 block">{r.desc}</span>
                          </div>
                          <span className="text-[10px] font-tech font-bold text-red-600 shrink-0">
                            {r.burn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Duration & Sync Profile Toggle */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] font-tech text-gray-500">
                      Estimated timeline: <strong>~{autoPlan.estimatedWeeks} weeks</strong>
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncToProfile}
                        onChange={(e) => setSyncToProfile(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      Sync {autoPlan.dailyCalories} kcal to my profile
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Goal"}
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

export default Goals;