import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getFoods, updateFood, deleteFood, getFoodStats } from "../services/foods";
import Sidebar from "../components/Sidebar";
import Icon from "../components/Icon";
import toast from "react-hot-toast";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", color: "bg-amber-100 text-amber-800", icon: "coffee" },
  { value: "lunch", label: "Lunch", color: "bg-emerald-100 text-emerald-800", icon: "utensils" },
  { value: "dinner", label: "Dinner", color: "bg-indigo-100 text-indigo-800", icon: "utensils" },
  { value: "snack", label: "Snacks", color: "bg-purple-100 text-purple-800", icon: "nutrition" },
];

const getMealInfo = (value) =>
  MEAL_TYPES.find((m) => m.value === value) || MEAL_TYPES[0];

const Nutrition = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    mealType: "breakfast",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterMeal, setFilterMeal] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (filterMeal !== "all") params.mealType = filterMeal;
      if (search) params.search = search;
      const res = await getFoods(params);
      setFoods(res.data);
    } catch (error) {
      toast.error("Failed to load food logs");
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
      name: food.name || food.foodName || "",
      quantity: food.quantity || 1,
      mealType: food.mealType || "breakfast",
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || food.fat || 0,
      date: food.date ? food.date.split("T")[0] : selectedDate,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "name" || name === "mealType" || name === "date"
          ? value
          : Number(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Food name is required");
      return;
    }
    setSaving(true);
    try {
      const foodTitle = form.name.trim();
      const fatsVal = Number(form.fats) || 0;
      await updateFood(editing, {
        ...form,
        name: foodTitle,
        foodName: foodTitle,
        fat: fatsVal,
        fats: fatsVal,
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        mealType: form.mealType === "snack" ? "snacks" : form.mealType,
      });
      window.dispatchEvent(new CustomEvent("fitness_data_updated", { detail: { type: "food" } }));
      toast.success("Food entry updated!");
      setShowModal(false);
      loadFoods();
    } catch (error) {
      toast.error("Failed to update food entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this food entry?")) return;
    try {
      await deleteFood(id);
      window.dispatchEvent(new CustomEvent("fitness_data_updated", { detail: { type: "food" } }));
      toast.success("Food entry removed");
      loadFoods();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const totalCals = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const totalP = foods.reduce((acc, f) => acc + (f.protein || 0), 0);
  const totalC = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
  const totalF = foods.reduce((acc, f) => acc + (f.fats || f.fat || 0), 0);

  return (
    <Sidebar>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="font-funky text-3xl font-extrabold text-slate-900">
              Nutrition & <span className="text-red-600">Meals</span>
            </h1>
            <p className="font-tech text-sm text-slate-500 mt-1">
              Track calories, macros, and photo food logs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAdd}
              className="vip-btn-primary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              + Log Meal
            </button>
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card p-5 rounded-2xl">
            <span className="font-tech text-[10px] uppercase font-bold text-slate-400">Total Calories</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-funky text-2xl font-black text-slate-900">{totalCals.toLocaleString()}</span>
              <span className="font-tech text-xs text-slate-500 font-bold">kcal</span>
            </div>
            <span className="text-xs font-tech text-slate-400 mt-1 block">Logged today</span>
          </div>

          <div className="stat-card p-5 rounded-2xl">
            <span className="font-tech text-[10px] uppercase font-bold text-slate-400">Protein</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-funky text-2xl font-black text-red-600">{totalP}</span>
              <span className="font-tech text-xs text-slate-500 font-bold">grams</span>
            </div>
            <span className="text-xs font-tech text-slate-400 mt-1 block">Muscle recovery</span>
          </div>

          <div className="stat-card p-5 rounded-2xl">
            <span className="font-tech text-[10px] uppercase font-bold text-slate-400">Carbs</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-funky text-2xl font-black text-amber-600">{totalC}</span>
              <span className="font-tech text-xs text-slate-500 font-bold">grams</span>
            </div>
            <span className="text-xs font-tech text-slate-400 mt-1 block">Daily energy</span>
          </div>

          <div className="stat-card p-5 rounded-2xl">
            <span className="font-tech text-[10px] uppercase font-bold text-slate-400">Fats</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-funky text-2xl font-black text-blue-600">{totalF}</span>
              <span className="font-tech text-xs text-slate-500 font-bold">grams</span>
            </div>
            <span className="text-xs font-tech text-slate-400 mt-1 block">Healthy fats</span>
          </div>
        </div>

        {/* Filter and Date Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-tech font-bold text-slate-800 focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setFilterMeal("all")}
                className={`px-3 py-1.5 rounded-xl font-tech text-xs uppercase font-bold transition ${
                  filterMeal === "all" ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Meals
              </button>
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setFilterMeal(m.value)}
                  className={`px-3 py-1.5 rounded-xl font-tech text-xs uppercase font-bold whitespace-nowrap transition ${
                    filterMeal === m.value ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-64 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logged food..."
              className="w-full px-4 py-2 pl-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Icon name="search" className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Food Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : foods.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-3 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl">
              🥗
            </div>
            <h3 className="font-funky font-bold text-lg text-slate-900 mb-1">
              No meals logged for this date
            </h3>
            <p className="font-tech text-xs text-slate-500 mb-6">
              Use Option 1 (Photo) or Option 2 (Manual Form) to log your first meal!
            </p>
            <button
              onClick={openAdd}
              className="vip-btn-primary px-6 py-2.5 rounded-xl font-funky font-bold text-xs uppercase tracking-wider"
            >
              + Add Meal Entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => {
              const meal = getMealInfo(food.mealType);
              const foodTitle = food.name || food.foodName;

              return (
                <div
                  key={food._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Photo if present */}
                  {food.image && (
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img
                        src={food.image}
                        alt={foodTitle}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-lg ${meal.color}`}>
                        {meal.label}
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {!food.image && (
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-lg ${meal.color}`}>
                            {meal.label}
                          </span>
                        </div>
                      )}

                      <h3 className="font-funky font-bold text-lg text-slate-900 mb-1">
                        {foodTitle}
                      </h3>

                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="font-funky text-2xl font-black text-slate-900">{food.calories}</span>
                        <span className="font-tech text-xs text-slate-500 font-bold">calories</span>
                      </div>

                      {/* Macros pill */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center font-tech text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 block font-bold">Protein</span>
                          <span className="font-bold text-red-600">{food.protein || 0}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 block font-bold">Carbs</span>
                          <span className="font-bold text-amber-600">{food.carbs || 0}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 block font-bold">Fats</span>
                          <span className="font-bold text-blue-600">{food.fats || food.fat || 0}g</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100">
                      <button
                        onClick={() => openEdit(food)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-tech font-bold text-xs uppercase tracking-wider transition text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-tech font-bold text-xs uppercase tracking-wider transition"
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

        {/* EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-funky font-bold text-lg text-slate-900">
                  Edit Food Entry
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      name="calories"
                      value={form.calories}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-tech"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                      Meal Type
                    </label>
                    <select
                      name="mealType"
                      value={form.mealType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-tech"
                    >
                      {MEAL_TYPES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      name="protein"
                      value={form.protein}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-tech font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      name="carbs"
                      value={form.carbs}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-tech font-bold text-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      name="fats"
                      value={form.fats}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs font-tech font-bold text-blue-600"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 vip-btn-primary py-2.5 rounded-xl font-funky font-bold text-xs uppercase tracking-wider"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-tech font-bold text-xs uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </Sidebar>
  );
};

export default Nutrition;