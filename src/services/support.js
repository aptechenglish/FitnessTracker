import api from "./api";

export const getSupportMeta = () => api.get("/support");
export const getContactInfo = () => api.get("/support/contact");
export const submitSupport = (data) => api.post("/support", data);
export const getMyTickets = () => api.get("/support/tickets");