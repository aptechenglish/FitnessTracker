import api from "./api";

export const getGoals = (status) => api.get("/goals", { params: { status } });
export const getGoalById = (id) => api.get(`/goals/${id}`);
export const createGoal = (data) => api.post("/goals", data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const getGoalTypes = () => api.get("/goals/types");