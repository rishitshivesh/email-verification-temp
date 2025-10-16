import axios from "axios";

import { apiClient, type ApiErrorResponse, type ApiSuccessResponse } from "./api-client";
import { authStorage, type StoredUser } from "./auth-storage";
import { DEFAULT_LOGIN_REDIRECT } from "./config";

export interface MagicLinkRequestPayload {
  email: string;
  redirectUrl?: string;
  state?: string;
}

export interface MagicLinkResponse {
  message?: string;
  requestId?: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  user: StoredUser;
  isNewUser: boolean;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LogoutResponse {
  message?: string;
}

export interface UserResponse {
  user: StoredUser;
}

export interface ProfileInput {
  name: string;
  phone?: string;
  address?: string;
}

export interface ProfileUpdate {
  name?: string;
  phone?: string;
  address?: string;
}

export interface ParsedApiError {
  message: string;
  code?: string;
  status?: number;
  requestId?: string;
  data?: ApiErrorResponse;
}

function parseAxiosError(error: unknown): ParsedApiError {
  const fallback: ParsedApiError = { message: "Something went wrong. Please try again.", code: undefined, status: undefined };
  if (!error) return fallback;

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    return {
      message: data?.message ?? error.message ?? fallback.message,
      code: data?.error,
      status: error.response?.status,
      requestId: data?.requestId,
      data,
    };
  }

  if (error instanceof Error) {
    return { ...fallback, message: error.message };
  }

  return fallback;
}

function persistAuthentication(result: AuthenticationResponse) {
  authStorage.setAccessToken(result.accessToken);
  authStorage.setUser(result.user);
}

export async function requestMagicLink(payload: MagicLinkRequestPayload) {
  const { data } = await apiClient.post<ApiSuccessResponse<MagicLinkResponse>>("/magic-link-email", payload);
  return data;
}

export async function verifyMagicLink(token: string, state?: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<AuthenticationResponse>>("/login-info", {
    params: { token, state },
  });
  persistAuthentication(data);
  return data;
}

export async function refreshAccessToken() {
  const { data } = await apiClient.patch<ApiSuccessResponse<RefreshTokenResponse>>("/login-info");
  authStorage.setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  const { data } = await apiClient.delete<ApiSuccessResponse<LogoutResponse>>("/login-info");
  authStorage.clear();
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiSuccessResponse<UserResponse>>("/whoami");
  authStorage.setUser(data.user);
  return data;
}

export async function completeProfile(payload: ProfileInput) {
  const { data } = await apiClient.post<ApiSuccessResponse<UserResponse>>("/whoami", payload);
  authStorage.setUser(data.user);
  return data;
}

export async function updateProfile(payload: ProfileUpdate) {
  const { data } = await apiClient.patch<ApiSuccessResponse<UserResponse>>("/whoami", payload);
  authStorage.setUser(data.user);
  return data;
}

export function getDefaultLoginRedirect() {
  return DEFAULT_LOGIN_REDIRECT;
}

export { parseAxiosError };
