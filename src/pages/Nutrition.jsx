import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getFoods, updateFood, deleteFood, getFoodStats } from "../services/foods";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", color: "bg-yellow-100 text-yellow-800", icon: "coffee" },
  { value: "lunch", label: "Lunch", color: "bg-orange-100 text-orange-700", icon: "utensils" },
  { value: "dinner", label: "Dinner", color: "bg-purple-100 text-purple-700", icon: "utensils" },
  { value: "snacks", label: "Snacks", color: "bg-pink-100 text-pink-700", icon: "nutrition" },
];

const getMealInfo = (value) => MEAL_TYPES.find((m) => m.value === value) || MEAL_TYPES[0];

const emptyFood = () => ({
  foodName: "",
  quantity: "",
  mealType: "breakfast",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  date: new Date().toISOString().split("T")[0],
});

const Nutrition = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyFood());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterMeal, setFilterMeal] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = { dateFrom: `${selectedDate}T00:00:00`, dateTo: `${selectedDate}T23:59:59` };
      if (filterMeal !== "all") params.mealType = filterMeal;
      if (search) params.search = search;
      const res = await getFoods(params);
      setFoods(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load foods");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, filterMeal, search]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    getFoodStats(selectedDate)
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [selectedDate, foods.length]);

  const openAdd = () => navigate("/nutrition/add");

  const openEdit = (food) => {
    setEditing(food._id);
    setForm({
      foodName: food.foodName,
      quantity: food.quantity,
      mealType: food.mealType,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      date: food.date.split("T")[0],
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "foodName" || name === "quantity" || name === "mealType" || name === "date" ? value : Number(value) || 0,
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
      const payload = { ...form, date: new Date(form.date).toISOString() };
      await updateFood(editing, payload);
      toast.success("Food entry updated!");
      setShowModal(false);
      loadFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save food");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this food entry?")) return;
    try {
      await deleteFood(id);
      toast.success("Food entry deleted");
      loadFoods();
    } catch (error) {
      toast.error("Failed to delete food entry");
    }
  };

  const macroBar = (label, grams, color) => {
    const max = stats?.totals.calories || 1;
    const width = max > 0 ? Math.min(100, (grams / max) * 100) : 0;
    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-semibold text-gray-800">{grams}g</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full">
          <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${width}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracking</h1>
            <p className="text-gray-600 mt-1">Track your daily food intake and macros</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Food
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Daily Summary
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-5 text-white">
              <div className="flex justify-between">
                <Icon name="flame" className="w-8 h-8 text-white/90" />
              </div>
              <p className="text-sm text-white/80">Calories</p>
              <p className="text-2xl font-bold">{stats?.totals.calories || 0}</p>
              <p className="text-xs text-white/70">{stats?.entries || 0} entries</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <Icon name="workouts" className="w-8 h-8 text-emerald-500" />
              <p className="text-sm text-gray-500 mt-2">Protein</p>
              <p className="text-2xl font-bold">{stats?.totals.protein || 0}g</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <Icon name="wheat" className="w-8 h-8 text-amber-500" />
              <p className="text-sm text-gray-500 mt-2">Carbs</p>
              <p className="text-2xl font-bold">{stats?.totals.carbs || 0}g</p>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <Icon name="droplet" className="w-8 h-8 text-blue-500" />
              <p className="text-sm text-gray-500 mt-2">Fat</p>
              <p className="text-2xl font-bold">{stats?.totals.fat || 0}g</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {macroBar("Protein", stats?.totals.protein || 0, "bg-emerald-500")}
            {macroBar("Carbs", stats?.totals.carbs || 0, "bg-amber-500")}
            {macroBar("Fat", stats?.totals.fat || 0, "bg-blue-500")}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search foods..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <select
            value={filterMeal}
            onChange={(e) => setFilterMeal(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Meals</option>
            {MEAL_TYPES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : foods.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <Icon name="utensils" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No food entries for this day</h3>
            <p className="text-gray-500 mb-6">Log your first meal to start tracking your nutrition!</p>
            <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Add Food
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => {
              const meal = getMealInfo(food.mealType);
              return (
                <div key={food._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon name={meal.icon} className="w-8 h-8 text-gray-500 shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{food.foodName}</h3>
                          {food.quantity && <p className="text-sm text-gray-500">{food.quantity}</p>}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meal.color}`}>
                        {meal.label}
                      </span>
                    </div>

                    <div className="flex justify-center mb-3">
                      <p className="text-3xl font-bold text-gray-800">{food.calories}</p>
                      <span className="text-gray-500"> cal</span>
                    </div>

                    <div className="flex gap-2 justify-center my-3">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded inline-flex items-center gap-1"><Icon name="workouts" className="w-3.5 h-3.5" /> {food.protein}g</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded inline-flex items-center gap-1"><Icon name="wheat" className="w-3.5 h-3.5" /> {food.carbs}g</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1"><Icon name="droplet" className="w-3.5 h-3.5" /> {food.fat}g</span>
                    </div>

                    <div className="flex gap-3 mt-4 border-t pt-4">
                      <button
                        onClick={() => openEdit(food)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white">
                Edit Food Entry
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:text-gray-200">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                      <option key={m.value} value={m.value}>{m.label}</option>
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

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Food"}
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

export default Nutrition;