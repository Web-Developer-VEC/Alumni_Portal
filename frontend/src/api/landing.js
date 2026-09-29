import api from "./api";

/**
 * Fetch all dynamic data for the landing page:
 * - Stats (alumni community, events, departments, years)
 * - Hero card stack alumni
 * - Alumni showcase list
 * - Upcoming events
 */
export const getLandingData = async () => {
    const response = await api.get("/landing");
    return response.data;
};

/**
 * Fetch events directly from events collection
 */
export const getUpcomingEvents = async () => {
    const response = await api.get("/event");
    return response.data;
};

export default {
    getLandingData,
    getUpcomingEvents,
};
