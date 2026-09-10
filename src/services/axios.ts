import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://propertyark-backend.onrender.com/api/v1"
).replace(/\/+$/, "");
const AUTH_PROXY_BASE_URL = "/api/v1";

function accessTokenFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const token = source.accessToken ?? source.token;
  if (typeof token === "string" && token) return token;
  return accessTokenFrom(source.data) ?? accessTokenFrom(source.result);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie
  timeout: 90_000,
});

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single-flight refresh queue so parallel 401s don't each trigger a refresh
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const authState = useAuthStore.getState();
    const requestPath = originalRequest.url ?? "";
    const isPublicAuthRequest = [
      "/auth/login",
      "/auth/reg",
      "/auth/refresh",
    ].some((path) => requestPath.includes(path));

    // Login and other public requests can legitimately return 401. Only try to
    // refresh an authenticated session; otherwise preserve the backend error.
    if (
      error.response?.status === 401 &&
      authState.isAuthenticated &&
      !isPublicAuthRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${AUTH_PROXY_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true, timeout: 90_000 },
        );
        const refreshedAccessToken = accessTokenFrom(data);
        if (!refreshedAccessToken) {
          throw new Error(
            "The refresh response did not include an access token.",
          );
        }
        useAuthStore.getState().setAccessToken(refreshedAccessToken);
        refreshQueue.forEach((cb) => cb(refreshedAccessToken));
        refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        // Keep admin routes inside the admin authentication flow. Falling back
        // to the public login loses the intended admin destination and can
        // incorrectly treat administrator credentials as a public session.
        const isAdminRoute = window.location.pathname.startsWith("/admin");
        const loginPath = isAdminRoute ? "/admin/login" : "/login";
        const redirect = `${window.location.pathname}${window.location.search}`;
        window.location.href = `${loginPath}?redirect=${encodeURIComponent(redirect)}`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
