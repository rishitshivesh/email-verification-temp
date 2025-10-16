import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "./config";
import { authStorage } from "./auth-storage";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const attachAuthorization = (config: InternalAxiosRequestConfig) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

const handleUnauthorized = (error: AxiosError) => {
  if (error?.response?.status === 401) {
    authStorage.clear();
  }
  return Promise.reject(error);
};

apiClient.interceptors.request.use(attachAuthorization);
apiClient.interceptors.response.use(undefined, handleUnauthorized);

export type ApiSuccessResponse<T> = { success: true } & T;
export interface ApiErrorResponse {
  success: false;
  error?: string;
  message?: string;
  requestId?: string;
  [key: string]: unknown;
}
