import { api } from "./client";
import type { AuthResponse, User } from "../types";

export function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuthRetry: true,
  });
}

export function login(data: { email: string; password: string }) {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    skipAuthRetry: true,
  });
}

export function refresh(refreshToken: string) {
  return api<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRetry: true,
  });
}

export function logout(refreshToken: string) {
  return api<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRetry: true,
  });
}

export function getMe() {
  return api<User>("/auth/me");
}
