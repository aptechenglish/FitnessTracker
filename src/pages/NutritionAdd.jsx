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
  { value: "snack", label: "Snacks", icon: "nutrition" },
];

const MEAL_PRESETS = [
  {
    name: "Grilled Chicken & Brown Rice Bowl",
    calories: 540,
    protein: 48,
    carbs: 60,
    fats: 12,
    mealType: "lunch",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Atlantic Salmon with Steamed Veggies",
    calories: 590,
    protein: 42,
    carbs: 24,
    fats: 28,
    mealType: "dinner",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Protein Oatmeal with Blueberries & Banana",
    calories: 420,
    protein: 26,
    carbs: 62,
    fats: 8,
    mealType: "breakfast",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Avocado & Poached Eggs Toast",
    calories: 460,
    protein: 20,
    carbs: 38,
    fats: 26,
    mealType: "breakfast",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Whey Protein Shake & Peanut Butter",
    calories: 340,
    protein: 34,
    carbs: 22,
    fats: 10,
    mealType: "snack",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
  },
];

const NutritionAdd = () => {
  const navigate = useNavigate();
  const [logMethod, setLogMethod] = useState("photo"); // "photo" or "manual"

  // Form State
  const [form, setForm] = useState({
    name: "",
    mealType: "lunch",
    calories: 450,
    protein: 30,
    carbs: 45,
    fats: 12,
    quantity: 1,
    unit: "serving",
    date: new Date().toISOString().split("T")[0],
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Handle file input for photo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setForm((prev) => ({
          ...prev,
          image: reader.result,
          name: prev.name || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset) => {
    setImagePreview(preset.image);
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fats: preset.fats,
      mealType: preset.mealType,
      image: preset.image,
    }));
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "name" || name === "mealType" || name === "unit" || name === "date" || name === "image"
          ? value
          : Number(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim() === "") {
      toast.error("Please enter a meal or food name");
      return;
    }

    setSaving(true);
    try {
      const foodTitle = form.name.trim();
      const fatsVal = Number(form.fats) || 0;
      await createFood({
        ...form,
        name: foodTitle,
        foodName: foodTitle,
        fat: fatsVal,
        fats: fatsVal,
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        mealType: form.mealType === "snack" ? "snacks" : form.mealType,
        date: new Date(form.date).toISOString(),
      });
      window.dispatchEvent(new CustomEvent("fitness_data_updated", { detail: { type: "food" } }));
      toast.success("Meal logged successfully!");
      navigate("/nutrition");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sidebar>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link & Header */}
        <div className="mb-6">
          <Link
            to="/nutrition"
            className="text-xs font-tech font-bold uppercase text-slate-500 hover:text-red-600 inline-flex items-center gap-1.5 transition"
          >
            <Icon name="arrowLeft" className="w-3.5 h-3.5" /> Back to Nutrition
          </Link>
          <h1 className="font-funky text-3xl font-extrabold text-slate-900 mt-2">
            Log Meal & <span className="text-red-600">Nutrition</span>
          </h1>
          <p className="font-tech text-xs text-slate-500 mt-1">
            Choose how you want to log: upload a meal picture or enter details manually
          </p>
        </div>

        {/* 2-Option Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
          <button
            type="button"
            onClick={() => setLogMethod("photo")}
            className={`py-3 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
              logMethod === "photo"
                ? "bg-red-600 text-white shadow-[0_4px_14px_rgba(229,57,53,0.35)] scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            📸 Option 1: Add Picture of Meal
          </button>
          <button
            type="button"
            onClick={() => setLogMethod("manual")}
            className={`py-3 rounded-xl font-funky text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
              logMethod === "manual"
                ? "bg-red-600 text-white shadow-[0_4px_14px_rgba(229,57,53,0.35)] scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            📝 Option 2: Manual Form
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OPTION 1: PHOTO MEAL LOG */}
            {logMethod === "photo" && (
              <div>
                <h2 className="font-funky font-bold text-base text-slate-900 mb-1">
                  Upload Meal Photo
                </h2>
                <p className="font-tech text-xs text-slate-500 mb-4">
                  Take or upload a photo of your dish, or select a smart meal preset below
                </p>

                {/* Upload Box / Image Preview */}
                <div className="relative border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center transition bg-slate-50/60 mb-6">
                  {imagePreview ? (
                    <div className="relative group max-w-sm mx-auto rounded-xl overflow-hidden shadow-md">
                      <img
                        src={imagePreview}
                        alt="Meal Preview"
                        className="w-full h-56 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setForm((prev) => ({ ...prev, image: "" }));
                        }}
                        className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-full text-xs font-bold shadow hover:bg-red-700 transition"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl shadow-sm">
                        📷
                      </div>
                      <p className="font-funky font-bold text-sm text-slate-800 mb-1">
                        Drop meal photo here or browse
                      </p>
                      <p className="font-tech text-xs text-slate-400 mb-4">
                        Supports PNG, JPG, WEBP formats
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-sm transition">
                        Select Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Quick Meal Photo Presets */}
                <div className="mb-6">
                  <span className="block font-tech text-xs uppercase font-bold text-slate-700 mb-2">
                    💡 Or pick a popular balanced meal:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {MEAL_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-red-500 bg-slate-50/50 hover:bg-red-50/40 text-left transition flex items-center gap-2.5 group"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-funky font-bold text-xs text-slate-800 group-hover:text-red-600 truncate">
                            {p.name}
                          </p>
                          <p className="font-tech text-[10px] text-slate-500 font-semibold">
                            {p.calories} cal • {p.protein}g P
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MEAL DETAILS FORM (Active for both modes) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-funky font-bold text-sm uppercase text-slate-800">
                Meal Details & Nutrients
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                    Food / Meal Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Grilled Chicken & Rice"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500"
                    required
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-500 bg-white"
                  >
                    {MEAL_TYPES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calories and Macros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={form.calories}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-tech font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-tech text-[10px] uppercase font-bold text-slate-600 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    name="protein"
                    value={form.protein}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-tech font-bold text-red-600 bg-white"
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
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-tech font-bold text-amber-600 bg-white"
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
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-tech font-bold text-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                    Portion Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-tech"
                  />
                </div>

                <div>
                  <label className="block font-tech text-xs uppercase font-bold text-slate-700 mb-1">
                    Date Logged
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-tech"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 vip-btn-primary py-3.5 rounded-xl font-funky font-extrabold text-xs uppercase tracking-wider text-center transition"
              >
                {saving ? "Saving Meal Entry..." : "✓ Save & Log Meal"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/nutrition")}
                className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-tech font-bold text-xs uppercase tracking-wider transition"
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