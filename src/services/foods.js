import api from "./api";

export const getFoods = (params) => api.get("/foods", { params });
export const createFood = (data) => api.post("/foods", data);
export const updateFood = (id, data) => api.put(`/foods/${id}`, data);
export const deleteFood = (id) => api.delete(`/foods/${id}`);
export const getFoodStats = (date) => api.get("/foods/stats", { params: { date } });