import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";
import { createFood } from "../services/foods";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: "coffee" },
  { value: "lunch", label: "Lunch", icon: "utensils" },
  { value: "dinner", label: "Dinner", icon: "utensils" },
  { value: "snacks", label: "Snacks", icon: "nutrition" },
];

const emptyFood = {
  foodName: "",
  quantity: "",
  mealType: "breakfast",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  date: new Date().toISOString().split("T")[0],
};

const NutritionAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyFood);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "foodName" || name === "quantity" || name === "mealType" || name === "date"
          ? value
          : Number(value) || 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodName) {
      toast.error("Food name is required");
      return;
    }
    setSaving(true);
    try {
      await createFood({ ...form, date: new Date(form.date).toISOString() });
      toast.success("Food entry added!");
      navigate("/nutrition");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save food");
      setSaving(false);
    }
  };

  return (
    <Sidebar>
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/nutrition" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
            <Icon name="arrowLeft" className="w-4 h-4" /> Back to Nutrition
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Add Food Entry</h1>
          <p className="text-gray-600 mt-1">Log a meal with its calories and macros</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Name *</label>
              <input
                type="text"
                name="foodName"
                value={form.foodName}
                onChange={handleChange}
                placeholder="e.g. Eggs + Bread"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="text"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 3 eggs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                <select
                  name="mealType"
                  value={form.mealType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={form.calories || ""}
                  onChange={handleChange}
                  placeholder="e.g. 450"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={form.protein || ""}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  name="carbs"
                  value={form.carbs || ""}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                <input
                  type="number"
                  name="fat"
                  value={form.fat || ""}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Food"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/nutrition")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </Sidebar>
  );
};

export default NutritionAdd;