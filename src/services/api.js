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

const MOCK_SETTINGS = {
  notificationPreferences: {
    email: true,
    workoutReminders: true,
    mealReminders: true,
    goalAchievements: true,
  },
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
      ? typeof config.data === "string"
        ? JSON.parse(config.data)
        : config.data
      : {};
  } catch {
    return {};
  }
};

const buildMockData = (config) => {
  const method = (config.method || "get").toLowerCase();
  const path = (config.url || "").split("?")[0].replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  const now = new Date().toISOString();
  const payload = parsePayload(config);

  const echoItem = () => ({
    _id: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    ...payload,
  });

  if (path === "/auth/me") {
    try {
      return JSON.parse(localStorage.getItem("fitness_user") || "{}");
    } catch {
      return {};
    }
  }
  if (path === "/auth/profile") return { message: "Profile updated", user: payload };
  if (path === "/auth/sample-data") return { message: "Sample data removed" };

  if (
    path === "/workouts" ||
    path === "/foods" ||
    path === "/measurements" ||
    path === "/goals" ||
    path === "/notifications" ||
    path === "/reminders"
  ) {
    if (method === "get") return [];
    if (method === "post") return echoItem();
    return { success: true, message: "OK" };
  }

  if (path === "/workouts/stats")
    return { totalWorkouts: 0, weeklyWorkouts: 0, totalCaloriesBurned: 0 };
  if (path === "/workouts/categories") return [];
  if (path === "/goals/types") return [];
  if (path === "/foods/stats")
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
  if (path === "/measurements/progress")
    return {
      weights: [],
      bodyFat: [],
      lifting: { benchPress: [], deadlift: [], squat: [], overheadPress: [] },
      measurements: [],
      running: [],
    };
  if (path === "/notifications/unread") return { unread: 0 };

  if (path === "/settings") return method === "put" ? { ...payload } : MOCK_SETTINGS;
  if (path === "/search") return { workouts: [], foods: [], users: [] };

  if (segments[0] === "support") {
    if (path === "/support/contact")
      return {
        email: "support@fittracker.app",
        phone: "+1 (555) 010-7272",
        hours: "Mon–Fri, 9am–6pm",
      };
    if (path === "/support/tickets") return [];
    if (method === "post" && path === "/support") return echoItem();
    return MOCK_SUPPORT_META;
  }

  if (path === "/dashboard") {
    return {
      summary: {
        totalWorkouts: 0,
        weekWorkouts: 0,
        totalCaloriesBurned: 0,
        totalCaloriesIn: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        currentWeight: 75,
        targetWeight: 72,
      },
      weightProgress: [],
      weeklyActivity: [],
      recentWorkouts: [],
      recentNutrition: [],
      goals: { weightLoss: 0, weeklyWorkouts: 0, calorieTarget: 0, activeDays: 0 },
    };
  }

  if (path === "/analytics/workouts")
    return {
      totals: { totalWorkouts: 0, totalCaloriesBurned: 0 },
      liftProgress: [],
      frequencyOverTime: { labels: [], data: [] },
      caloriesOverTime: { labels: [], data: [] },
      categoryBreakdown: {},
      exerciseHistory: [],
    };
  if (path === "/analytics/nutrition")
    return {
      totalEntries: 0,
      avgCalories: 0,
      caloriesTrend: { labels: [], data: [] },
      macroTrend: { labels: [], protein: [], carbs: [], fat: [] },
      macroTotals: { protein: 0, carbs: 0, fat: 0 },
      mealTypeBreakdown: {},
    };

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
        return Promise.resolve({
          data: mock,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;