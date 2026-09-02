import api from "./api";

export const getMeasurements = (params) => api.get("/measurements", { params });
export const createMeasurement = (data) => api.post("/measurements", data);
export const updateMeasurement = (id, data) => api.put(`/measurements/${id}`, data);
export const deleteMeasurement = (id) => api.delete(`/measurements/${id}`);
export const getProgress = () => api.get("/measurements/progress");