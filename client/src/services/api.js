import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  timeout: 60000,
});
api.interceptors.request.use((c) => {
  const token =
    localStorage.getItem("tf-token") || sessionStorage.getItem("tf-token");
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});
export const errorMessage = (e) =>
  e.response?.data?.message ||
  (e.code === "ECONNABORTED"
    ? "The server is taking longer than usual. Please try again."
    : "Cannot reach the server. Check your connection and try again.");
