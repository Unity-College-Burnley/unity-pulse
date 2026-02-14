// ============================================================
// API service — thin wrapper around fetch for calling the backend.
// In static mode (GitHub Pages), requests are handled by mock
// handlers bundled into the client build.
// ============================================================

const BASE_URL = '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let handleMockRequest: ((method: string, path: string, body?: any) => { status: number; data: any }) | null = null;

if (USE_MOCK) {
  // Dynamic import so mock code is only bundled in static builds
  import('../mock/handlers').then((mod) => {
    handleMockRequest = mod.handleMockRequest;
  });
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('unity-pulse-token');
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extra,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private mockRequest<T>(method: string, path: string, body?: unknown): T {
    if (!handleMockRequest) {
      throw new Error('Mock handlers not loaded yet');
    }
    const result = handleMockRequest(method, `${BASE_URL}${path}`, body);
    if (result.status >= 400) {
      throw new Error(result.data?.error || `Request failed (${result.status})`);
    }
    return result.data as T;
  }

  async get<T>(path: string): Promise<T> {
    if (USE_MOCK) {
      // Small delay to simulate network and ensure handlers are loaded
      await new Promise((r) => setTimeout(r, 50));
      return this.mockRequest<T>('GET', path);
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }

    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 50));
      return this.mockRequest<T>('POST', path, body);
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return res.json();
  }

  async delete<T>(path: string): Promise<T> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 50));
      return this.mockRequest<T>('DELETE', path);
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return res.json();
  }
}

export const api = new ApiClient();
