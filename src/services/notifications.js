import api from "./api";

export const getNotifications = () => api.get("/notifications");
export const getUnreadCount = () => api.get("/notifications/unread");
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.post("/notifications/read-all");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const createNotification = (data) => api.post("/notifications", data);