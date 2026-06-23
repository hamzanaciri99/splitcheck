import type { AuthTokens } from './types';
import type { StorageAdapter } from './storage';

const ACCESS_TOKEN_KEY = 'splitcheck.accessToken';
const REFRESH_TOKEN_KEY = 'splitcheck.refreshToken';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export class ApiClient {
  private baseUrl: string;
  private storage: StorageAdapter;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string, storage: StorageAdapter) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.storage = storage;
  }

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      this.storage.getItem(ACCESS_TOKEN_KEY),
      this.storage.getItem(REFRESH_TOKEN_KEY),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      this.storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
      this.storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(ACCESS_TOKEN_KEY),
      this.storage.removeItem(REFRESH_TOKEN_KEY),
    ]);
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) return false;

    const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!res.ok) {
      await this.clearTokens();
      return false;
    }

    const data = (await res.json()) as AuthTokens;
    await this.setTokens(data);
    return true;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, auth = true } = options;
    const doFetch = async (): Promise<Response> => {
      const headers: Record<string, string> = {};
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (auth) {
        const tokens = await this.getTokens();
        if (tokens) headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
      return fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    };

    let res = await doFetch();

    if (res.status === 401 && auth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        res = await doFetch();
      }
    }

    if (!res.ok) {
      const payload = await res.json().catch(() => undefined);
      throw new ApiError(res.status, (payload as { message?: string })?.message ?? res.statusText, payload);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  async requestForm<T>(path: string, form: FormData, options: { auth?: boolean } = {}): Promise<T> {
    const { auth = true } = options;
    const headers: Record<string, string> = {};
    if (auth) {
      const tokens = await this.getTokens();
      if (tokens) headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
    const res = await fetch(`${this.baseUrl}${path}`, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const payload = await res.json().catch(() => undefined);
      throw new ApiError(res.status, (payload as { message?: string })?.message ?? res.statusText, payload);
    }
    return (await res.json()) as T;
  }

  get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  patch<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
