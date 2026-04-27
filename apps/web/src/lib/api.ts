import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for refresh cookie
  timeout: 10000,  // shorter timeout so guest mode fails fast
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent refresh on 401 ───────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue other requests until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post<{ success: boolean; data: { accessToken: string } }>(
          '/auth/refresh'
        );
        const newToken = response.data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);

        // Flush queue
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (_refreshError) {
        refreshQueue = [];
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh'),
};

// ── User API ──────────────────────────────────────────────────────────────────

export const userApi = {
  getMe: () => api.get('/user/me'),
  getStats: () => api.get('/user/stats'),
  getHeatmap: () => api.get('/user/heatmap'),
  getModuleStats: (module: string) => api.get(`/user/module/${module}`),
  updateProfile: (data: object) => api.patch('/user/profile', data),
  changePassword: (data: object) => api.post('/user/change-password', data),
  exportData: () => api.get('/user/export', { responseType: 'blob' }),
  deleteAccount: () => api.delete('/user/account'),
};

// ── Sessions API ──────────────────────────────────────────────────────────────

export const sessionsApi = {
  start: (data: { module: string; difficulty: string }) =>
    api.post('/sessions/start', data),
  end: (id: string, data: object) =>
    api.post(`/sessions/${id}/end`, data),
  list: (page?: number) => api.get('/sessions', { params: { page } }),
};

// ── Questions API ─────────────────────────────────────────────────────────────

export const questionsApi = {
  log: (data: object) => api.post('/questions/log', data),
};

// ── Leaderboard API ───────────────────────────────────────────────────────────

export const leaderboardApi = {
  getTop100: () => api.get('/leaderboard'),
  getMyRank: () => api.get('/leaderboard/rank/me'),
};
