import type { AuthResponse } from "../types";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "/api";

const ACCESS_TOKEN_KEY = "taskboard_token";
const REFRESH_TOKEN_KEY = "taskboard_refresh_token";

const AUTH_PATHS_NO_RETRY = ["/auth/login", "/auth/register", "/auth/refresh"];

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiOptions extends RequestInit {
  skipAuthRetry?: boolean;
}

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** @deprecated Use setTokens / clearTokens */
export function setToken(token: string | null) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else clearTokens();
}

function parseBody(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    const obj = body as { error?: unknown; message?: unknown };
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
  }
  return `Request failed (${status})`;
}

let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("Session expired", 401);
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const text = await res.text();
  const body = parseBody(text);

  if (!res.ok) {
    clearTokens();
    throw new ApiError(errorMessage(body, res.status), res.status, body);
  }

  const { accessToken, refreshToken: newRefreshToken } = body as AuthResponse;
  setTokens(accessToken, newRefreshToken);
}

function refreshTokensOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function shouldAttemptRefresh(path: string, skipAuthRetry?: boolean): boolean {
  if (skipAuthRetry) return false;
  return !AUTH_PATHS_NO_RETRY.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}?`),
  );
}

async function request<T>(
  path: string,
  options: ApiOptions = {},
  isRetry = false,
): Promise<T> {
  const { skipAuthRetry, ...fetchOptions } = options;
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  const text = await res.text();
  const body = parseBody(text);

  if (res.status === 401 && !isRetry && shouldAttemptRefresh(path, skipAuthRetry)) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await refreshTokensOnce();
        return request<T>(path, options, true);
      } catch {
        clearTokens();
      }
    }
  }

  if (!res.ok) {
    throw new ApiError(errorMessage(body, res.status), res.status, body);
  }

  return body as T;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  return request<T>(path, options);
}
