import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://fitness-tracker-backend-ten.vercel.app/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── LocalStorage-backed offline/demo store ─────────────────────────────────
const STORE_KEY = "fitness_offline_store";

const getStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
  catch { return {}; }
};

const saveStore = (store) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {}
};

const getCollection = (name) => {
  const store = getStore();
  return store[name] || [];
};

const setCollection = (name, arr) => {
  const store = getStore();
  store[name] = arr;
  saveStore(store);
};

const pathToCollection = (path) => {
  if (path === "/workouts") return "workouts";
  if (path === "/foods") return "foods";
  if (path === "/measurements") return "measurements";
  if (path === "/goals") return "goals";
  if (path === "/notifications") return "notifications";
  if (path === "/reminders") return "reminders";
  return null;
};

// ── Static mock helpers ────────────────────────────────────────────────────
const MOCK_SETTINGS = {
  notificationPreferences: { email: true, workoutReminders: true, mealReminders: true, goalAchievements: true },
  units: { weight: "kg", height: "cm" },
  theme: "dark",
};

const MOCK_SUPPORT_META = {
  contact: { labels: ["general", "partnership", "billing", "account"] },
  issue: { labels: ["bug", "login", "data", "crash", "performance", "other"] },
  feedback: { labels: ["feature", "improvement", "praise", "other"] },
};

const parsePayload = (config) => {
  try {
    return config.data
      ? typeof config.data === "string" ? JSON.parse(config.data) : config.data
      : {};
  } catch { return {}; }
};

// ── Build offline mock response WITH localStorage persistence ─────────────
const buildMockData = (config) => {
  const method = (config.method || "get").toLowerCase();
  const path = (config.url || "").split("?")[0].replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  const now = new Date().toISOString();
  const payload = parsePayload(config);
  const makeId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Auth endpoints
  if (path === "/auth/me") {
    try { return JSON.parse(localStorage.getItem("fitness_user") || "{}"); }
    catch { return {}; }
  }
  if (path === "/auth/profile") return { message: "Profile updated", user: payload };
  if (path === "/auth/sample-data") return { message: "Sample data removed" };

  // List resources — persisted to localStorage
  const collection = pathToCollection(path);
  if (collection) {
    if (method === "get") return getCollection(collection);
    if (method === "post") {
      const item = { _id: makeId(), createdAt: now, updatedAt: now, ...payload };
      const arr = getCollection(collection);
      arr.unshift(item);
      setCollection(collection, arr);
      return item;
    }
    if (method === "put" || method === "patch") {
      const arr = getCollection(collection);
      const idx = arr.findIndex((x) => x._id === segments[segments.length - 1]);
      if (idx !== -1) { arr[idx] = { ...arr[idx], ...payload, updatedAt: now }; setCollection(collection, arr); return arr[idx]; }
      return { ...payload, updatedAt: now };
    }
    if (method === "delete") {
      const id = segments[segments.length - 1];
      setCollection(collection, getCollection(collection).filter((x) => x._id !== id));
      return { message: "Deleted successfully" };
    }
  }

  // Item-level routes
  if (segments[0] === "workouts" && segments.length === 2) {
    const id = segments[1];
    if (method === "get") return getCollection("workouts").find((x) => x._id === id) || null;
    if (method === "put" || method === "patch") {
      const arr = getCollection("workouts");
      const idx = arr.findIndex((x) => x._id === id);
      if (idx !== -1) { arr[idx] = { ...arr[idx], ...payload, updatedAt: now }; setCollection("workouts", arr); return arr[idx]; }
    }
    if (method === "delete") { setCollection("workouts", getCollection("workouts").filter((x) => x._id !== id)); return { message: "Deleted" }; }
  }

  if (segments[0] === "foods" && segments.length === 2) {
    const id = segments[1];
    if (method === "put" || method === "patch") {
      const arr = getCollection("foods");
      const idx = arr.findIndex((x) => x._id === id);
      if (idx !== -1) { arr[idx] = { ...arr[idx], ...payload, updatedAt: now }; setCollection("foods", arr); return arr[idx]; }
    }
    if (method === "delete") { setCollection("foods", getCollection("foods").filter((x) => x._id !== id)); return { message: "Deleted" }; }
  }

  if (segments[0] === "measurements" && segments.length === 2) {
    const id = segments[1];
    if (method === "put" || method === "patch") {
      const arr = getCollection("measurements");
      const idx = arr.findIndex((x) => x._id === id);
      if (idx !== -1) { arr[idx] = { ...arr[idx], ...payload, updatedAt: now }; setCollection("measurements", arr); return arr[idx]; }
    }
    if (method === "delete") { setCollection("measurements", getCollection("measurements").filter((x) => x._id !== id)); return { message: "Deleted" }; }
  }

  if (segments[0] === "goals" && segments.length === 2) {
    const id = segments[1];
    if (method === "put" || method === "patch") {
      const arr = getCollection("goals");
      const idx = arr.findIndex((x) => x._id === id);
      if (idx !== -1) { arr[idx] = { ...arr[idx], ...payload, updatedAt: now }; setCollection("goals", arr); return arr[idx]; }
    }
    if (method === "delete") { setCollection("goals", getCollection("goals").filter((x) => x._id !== id)); return { message: "Deleted" }; }
  }

  // Stats & derived endpoints (computed from local store)
  if (path === "/workouts/stats") {
    const workouts = getCollection("workouts");
    return {
      totalWorkouts: workouts.length,
      weeklyWorkouts: workouts.filter((w) => { const diff = (new Date() - new Date(w.date || w.createdAt)) / 86400000; return diff <= 7; }).length,
      totalCaloriesBurned: workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0),
    };
  }

  if (path === "/workouts/categories")
    return ["strength", "cardio", "hiit", "flexibility", "crossfit", "chest", "back", "legs", "shoulders", "arms", "core", "other"];

  if (path === "/goals/types") return [];

  if (path === "/foods/stats") {
    const foods = getCollection("foods");
    return {
      totalCalories: foods.reduce((s, f) => s + (f.calories || 0), 0),
      totalProtein: foods.reduce((s, f) => s + (f.protein || 0), 0),
      totalCarbs: foods.reduce((s, f) => s + (f.carbs || 0), 0),
      totalFat: foods.reduce((s, f) => s + (f.fats || f.fat || 0), 0),
      mealBreakdown: {
        breakfast: foods.filter((f) => f.mealType === "breakfast"),
        lunch: foods.filter((f) => f.mealType === "lunch"),
        dinner: foods.filter((f) => f.mealType === "dinner"),
        snack: foods.filter((f) => f.mealType === "snack"),
      },
    };
  }

  if (path === "/measurements/progress") {
    const measurements = getCollection("measurements");
    return {
      weights: measurements.map((m) => ({ date: m.date, value: m.weight })).filter((x) => x.value),
      bodyFat: measurements.map((m) => ({ date: m.date, value: m.bodyFat })).filter((x) => x.value),
      lifting: {
        benchPress: measurements.map((m) => ({ date: m.date, value: m.lifting?.benchPress })).filter((x) => x.value),
        deadlift: measurements.map((m) => ({ date: m.date, value: m.lifting?.deadlift })).filter((x) => x.value),
        squat: measurements.map((m) => ({ date: m.date, value: m.lifting?.squat })).filter((x) => x.value),
        overheadPress: measurements.map((m) => ({ date: m.date, value: m.lifting?.overheadPress })).filter((x) => x.value),
      },
      measurements: measurements,
      running: measurements.map((m) => ({ date: m.date, value: m.running?.distance })).filter((x) => x.value),
    };
  }

  if (path === "/notifications/unread")
    return { unread: getCollection("notifications").filter((n) => !n.read).length };

  if (path === "/settings") return method === "put" ? { ...payload } : MOCK_SETTINGS;
  if (path === "/search") return { workouts: [], foods: [], users: [] };

  if (segments[0] === "support") {
    if (path === "/support/contact") return { email: "support@fittracker.app", phone: "+1 (555) 010-7272", hours: "Mon–Fri, 9am–6pm" };
    if (path === "/support/tickets") return [];
    if (method === "post" && path === "/support") return { _id: makeId(), createdAt: now, ...payload };
    return MOCK_SUPPORT_META;
  }

  if (path === "/dashboard") {
    const workouts = getCollection("workouts");
    const foods = getCollection("foods");
    const goals = getCollection("goals");
    let savedUser = {};
    try { savedUser = JSON.parse(localStorage.getItem("fitness_user") || "{}"); } catch {}
    return {
      summary: {
        totalWorkouts: workouts.length,
        weekWorkouts: workouts.filter((w) => { const diff = (new Date() - new Date(w.date || w.createdAt)) / 86400000; return diff <= 7; }).length,
        totalCaloriesBurned: workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0),
        totalCaloriesIn: foods.reduce((s, f) => s + (f.calories || 0), 0),
        totalProtein: foods.reduce((s, f) => s + (f.protein || 0), 0),
        totalCarbs: foods.reduce((s, f) => s + (f.carbs || 0), 0),
        totalFat: foods.reduce((s, f) => s + (f.fats || f.fat || 0), 0),
        currentWeight: savedUser.weight || 75,
        targetWeight: savedUser.targetWeight || 72,
      },
      weightProgress: [],
      weeklyActivity: [],
      recentWorkouts: workouts.slice(0, 5),
      recentNutrition: foods.slice(0, 5),
      goals: { weightLoss: goals.filter((g) => g.type === "weight").length, weeklyWorkouts: 0, calorieTarget: 0, activeDays: 0 },
    };
  }

  if (path === "/analytics/workouts") {
    const workouts = getCollection("workouts");
    return {
      totals: { totalWorkouts: workouts.length, totalCaloriesBurned: workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0) },
      liftProgress: [],
      frequencyOverTime: { labels: [], data: [] },
      caloriesOverTime: { labels: [], data: [] },
      categoryBreakdown: workouts.reduce((acc, w) => { acc[w.category] = (acc[w.category] || 0) + 1; return acc; }, {}),
      exerciseHistory: [],
    };
  }

  if (path === "/analytics/nutrition") {
    const foods = getCollection("foods");
    return {
      totalEntries: foods.length,
      avgCalories: foods.length ? Math.round(foods.reduce((s, f) => s + (f.calories || 0), 0) / foods.length) : 0,
      caloriesTrend: { labels: [], data: [] },
      macroTrend: { labels: [], protein: [], carbs: [], fat: [] },
      macroTotals: { protein: foods.reduce((s, f) => s + (f.protein || 0), 0), carbs: foods.reduce((s, f) => s + (f.carbs || 0), 0), fat: foods.reduce((s, f) => s + (f.fats || f.fat || 0), 0) },
      mealTypeBreakdown: foods.reduce((acc, f) => { acc[f.mealType] = (acc[f.mealType] || 0) + 1; return acc; }, {}),
    };
  }

  if (method === "get") return [];
  return { success: true, message: "OK" };
};

const isDemoToken = () =>
  typeof window !== "undefined" &&
  String(localStorage.getItem("token") || "").startsWith("demo-");

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const status = error.response?.status;
    const url = config.url || "";
    const isAuthRequest = url.startsWith("/auth/");
    const demoMode = isDemoToken();
    const offline = !error.response;

    if (!demoMode && !isAuthRequest && (status === 401 || status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("fitness_user");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
      return Promise.reject(error);
    }

    if (demoMode || offline) {
      if (isAuthRequest && url !== "/auth/me") {
        return Promise.reject(error);
      }
      const mock = buildMockData(config);
      if (mock !== null && mock !== undefined) {
        return Promise.resolve({ data: mock, status: 200, statusText: "OK", headers: {}, config });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
