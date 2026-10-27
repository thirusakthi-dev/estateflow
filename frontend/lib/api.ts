import axios from "axios";

const TOKEN_KEY = "estateflow_token";
const USER_KEY = "estateflow_user";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api`,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Attach JWT to requests automatically.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Handle invalid or expired sessions.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith("/auth/login");

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

// Extract readable error messages from API responses.
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    // Prefer the backend's actual error message.
    if (
      responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    // Handle network and timeout errors.
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (!error.response) {
      return "Unable to connect to the server. Please try again.";
    }

    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
