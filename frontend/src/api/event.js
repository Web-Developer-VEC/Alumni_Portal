import api from "./api";

/* GET /api/hod/getevents */
export const getAllEvents = async (params = {}) => {
  const response = await api.get("/hod/getevents", { params });
  return response.data;
};

/* POST /api/hod/events  (FormData; cover file in field "image")
   Don't set Content-Type for FormData: the browser adds the multipart boundary. */
export const createEvent = async (eventData) => {
  const response = await api.post("/hod/events", eventData);
  return response.data;
};

/* PUT /api/hod/updateevents/:id   (change .put to .patch if your route uses PATCH) */
export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/hod/updateevents/${id}`, eventData);
  return response.data;
};

/* DELETE /api/hod/deleteevents/:id */
export const deleteEvent = async (id) => {
  const response = await api.delete(`/hod/deleteevents/${id}`);
  return response.data;
};

export default { getAllEvents, createEvent, updateEvent, deleteEvent };