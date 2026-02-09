import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'crux_token';
const REFRESH_TOKEN_KEY = 'crux_refresh_token';

// API on michael-se1 via Tailscale
let API_BASE = 'http://100.107.193.6:3001/api/v1';

export function setApiBase(url: string) {
  API_BASE = url;
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setTokens(token: string, refreshToken: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const { data } = await res.json();
    await setTokens(data.token, data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public apiError: ApiError,
  ) {
    super(apiError.message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | undefined>,
): Promise<T> {
  const token = await getToken();

  let url = `${API_BASE}${path}`;
  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) search.set(key, value);
    }
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try refresh on 401
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    }
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    throw new ApiRequestError(res.status, json.error ?? { code: 'UNKNOWN', message: 'Request failed' });
  }

  return json;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | undefined>) =>
    request<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) =>
    request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) =>
    request<T>('PUT', path, body),
  delete: <T>(path: string) =>
    request<T>('DELETE', path),
};
