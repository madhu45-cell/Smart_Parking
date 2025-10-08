import axios from "axios";
const API = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

export const fetchSlots = () => API.get("/slots/");
export const setSlotStatus = (id, status) => API.post(`/slots/${id}/set_status/`, { status });
export const createBooking = (data) => API.post("/bookings/", data);
export const fetchBookings = () => API.get("/bookings/");
