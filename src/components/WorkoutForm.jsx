import { useState } from "react";
import toast from "react-hot-toast";

export const CATEGORIES = [
  { value: "strength", label: "Strength", color: "bg-red-100 text-red-700", icon: "workouts" },
  { value: "cardio", label: "Cardio", color: "bg-green-100 text-green-700", icon: "activity" },
  { value: "flexibility", label: "Flexibility", color: "bg-purple-100 text-purple-700", icon: "sparkles" },
  { value: "balance", label: "Balance", color: "bg-blue-100 text-blue-700", icon: "scale" },
  { value: "hiit", label: "HIIT", color: "bg-orange-100 text-orange-700", icon: "flame" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-700", icon: "trophy" },
];

export const TAGS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Full Body",
  "Running",
  "Stretching",
  "Stamina",
  "Power",
  "Endurance",
];

export const getCategoryInfo = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[5];

export const emptyExercise = () => ({
  name: "",
  sets: 0,
  reps: 0,
  weight: 0,
  duration: 0,
  distance: 0,
  notes: "",
});

export const emptyWorkout = () => ({
  workoutName: "",
  category: "strength",
  exercises: [emptyExercise()],
  tags: [],
  caloriesBurned: 0,
  durationMinutes: 0,
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

export const workoutFromExisting = (workout) => ({
  workoutName: workout.workoutName,
  category: workout.category,
  exercises: workout.exercises.length
    ? workout.exercises.map((e) => ({ ...e }))
    : [emptyExercise()],
  tags: workout.tags || [],
  caloriesBurned: workout.caloriesBurned,
  durationMinutes: workout.durationMinutes,
  date: workout.date ? String(workout.date).split("T")[0] : new Date().toISOString().split("T")[0],
  notes: workout.notes || "",
});

const WorkoutForm = ({ initial, onSubmit, onCancel, saving, submitLabel }) => {
  const [form, setForm] = useState(initial);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...form.exercises];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" || field === "notes" ? value : Number(value) || 0,
    };
    setForm({ ...form, exercises: updated });
  };

  const addExercise = () => {
    setForm({ ...form, exercises: [...form.exercises, emptyExercise()] });
  };

  const removeExercise = (index) => {
    const updated = form.exercises.filter((_, i) => i !== index);
    setForm({ ...form, exercises: updated.length ? updated : [emptyExercise()] });
  };

  const toggleTag = (tag) => {
    const has = form.tags.includes(tag);
    setForm({
      ...form,
      tags: has ? form.tags.filter((t) => t !== tag) : [...form.tags, tag],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.workoutName) {
      toast.error("Workout name is required");
      return;
    }
    const validExercises = form.exercises.filter((ex) => ex.name.trim());
    if (!validExercises.length) {
      toast.error("Add at least one exercise with a name");
      return;
    }
    onSubmit({
      ...form,
      date: new Date(form.date).toISOString(),
      exercises: validExercises,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Workout Name *</label>
          <input
            type="text"
            name="workoutName"
            value={form.workoutName}
            onChange={handleChange}
            placeholder="e.g. Chest Day"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Exercises</label>
        <div className="space-y-3">
          {form.exercises.map((ex, i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-3">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleExerciseChange(i, "name", e.target.value)}
                    placeholder={`Exercise ${i + 1} name (e.g. Bench Press)`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <input
                  type="number"
                  value={ex.sets || ""}
                  onChange={(e) => handleExerciseChange(i, "sets", e.target.value)}
                  placeholder="Sets"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <input
                  type="number"
                  value={ex.reps || ""}
                  onChange={(e) => handleExerciseChange(i, "reps", e.target.value)}
                  placeholder="Reps"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <input
                  type="number"
                  value={ex.weight || ""}
                  onChange={(e) => handleExerciseChange(i, "weight", e.target.value)}
                  placeholder="Weight (kg)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <input
                  type="number"
                  value={ex.duration || ""}
                  onChange={(e) => handleExerciseChange(i, "duration", e.target.value)}
                  placeholder="Duration (min)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <input
                  type="number"
                  value={ex.distance || ""}
                  onChange={(e) => handleExerciseChange(i, "distance", e.target.value)}
                  placeholder="Distance (km)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <input
                  type="text"
                  value={ex.notes}
                  onChange={(e) => handleExerciseChange(i, "notes", e.target.value)}
                  placeholder="Notes (e.g. Increase weight next week)"
                  className="col-span-2 md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => removeExercise(i)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove exercise
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExercise}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + Add Exercise
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                form.tags.includes(tag)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calories Burned</label>
          <input
            type="number"
            name="caloriesBurned"
            value={form.caloriesBurned || ""}
            onChange={handleChange}
            placeholder="e.g. 350"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
          <input
            type="number"
            name="durationMinutes"
            value={form.durationMinutes || ""}
            onChange={handleChange}
            placeholder="e.g. 60"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Workout Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows="2"
          placeholder="Overall session notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default WorkoutForm;