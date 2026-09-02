import api from "./api";

export const getWorkouts = (params) => api.get("/workouts", { params });
export const getWorkoutById = (id) => api.get(`/workouts/${id}`);
export const createWorkout = (data) => api.post("/workouts", data);
export const updateWorkout = (id, data) => api.put(`/workouts/${id}`, data);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`);
export const getWorkoutStats = () => api.get("/workouts/stats");
export const getWorkoutCategories = () => api.get("/workouts/categories");
