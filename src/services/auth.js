import api from "./api";

export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const getCurrentUser = () => api.get("/auth/me");
export const updateProfile = (profileData) => api.put("/auth/profile", profileData);
export const removeSampleData = () => api.delete("/auth/sample-data");
