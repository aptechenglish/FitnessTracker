import api from "./api";

export const searchAll = (params) => api.get("/search", { params });