import AsyncStorage from '@react-native-async-storage/async-storage';

// Hosted backend (cPanel). Override at build time with EXPO_PUBLIC_API_URL if needed.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://bensd-ouss.com/api';
const TOKEN_KEY = 'hanout_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const setToken = async (token: string | null) => {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
};

export async function apiFetch(
  path: string,
  { method = 'GET', body, headers }: { method?: string; body?: object; headers?: Record<string, string> } = {}
) {
  const token = await getToken();
  const finalHeaders: Record<string, string> = { ...(headers || {}) };
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(data?.error || `Erreur ${res.status}`, res.status);
  }
  return data;
}
