import api from "./api";

export const getWorkoutAnalytics = (period) =>
  api.get("/analytics/workouts", { params: { period } });
export const getNutritionAnalytics = (period) =>
  api.get("/analytics/nutrition", { params: { period } });