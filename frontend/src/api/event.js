import api from "./api";

/**
 * Fetch all events from backend
 */
export const getAllEvents = async (params = {}) => {
    const response = await api.get("/event", { params });
    return response.data;
};

/**
 * Create a new event (supports FormData for image upload)
 */
export const createEvent = async (eventData) => {
    const isFormData = eventData instanceof FormData;
    const response = await api.post("/event", eventData, {
        headers: isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" },
    });
    return response.data;
};

export default {
    getAllEvents,
    createEvent,
};
