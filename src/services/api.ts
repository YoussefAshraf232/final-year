import axios, { AxiosResponse } from 'axios';
import { tokenStorage } from '@/lib/tokenStorage';

type JsonRecord = Record<string, unknown>;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const COLLECTION_PATHS = [
  '/categories',
  '/products',
  '/customers',
  '/suppliers',
  '/warehouses',
  '/users',
  '/roles',
  '/stock',
  '/sales-invoices',
  '/purchase-invoices',
  '/internal-invoices',
  '/return-invoices',
  '/return-sales-invoices',
  '/return-purchase-invoices',
  '/audit-logs',
  '/notifications',
  '/purchase-orders',
  '/sales-orders',
  '/payments',
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeUser(value: unknown): unknown {
  if (!isRecord(value)) return value;
  const normalized: JsonRecord = { ...value };
  if (typeof normalized.role !== 'string' && typeof normalized.roleName === 'string') {
    normalized.role = normalized.roleName;
  }
  if (typeof normalized.joinedAt !== 'string' && typeof normalized.createdAt === 'string') {
    normalized.joinedAt = normalized.createdAt;
  }
  return normalized;
}

function normalizeNestedUsers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeNestedUsers);
  if (!isRecord(value)) return value;

  const normalized: JsonRecord = {};
  for (const [key, item] of Object.entries(value)) {
    normalized[key] = key === 'user' ? normalizeUser(item) : normalizeNestedUsers(item);
  }
  return normalizeUser(normalized);
}

function paginated<T>(content: T[]) {
  return {
    content,
    totalPages: content.length > 0 ? 1 : 0,
    totalElements: content.length,
    number: 0,
    size: content.length,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function normalizePaginated(value: JsonRecord) {
  const content = Array.isArray(value.content) ? value.content : [];
  const size = typeof value.size === 'number' ? value.size : content.length;
  const totalElements =
    typeof value.totalElements === 'number' ? value.totalElements : content.length;
  return {
    ...value,
    content,
    totalPages: typeof value.totalPages === 'number' ? value.totalPages : 0,
    totalElements,
    number: typeof value.number === 'number' ? value.number : 0,
    size,
    first: typeof value.first === 'boolean' ? value.first : true,
    last: typeof value.last === 'boolean' ? value.last : true,
    empty: typeof value.empty === 'boolean' ? value.empty : content.length === 0,
  };
}

function isPaginated(value: unknown): boolean {
  return isRecord(value) && Array.isArray(value.content) && typeof value.totalElements === 'number';
}

function isApiResponse(value: unknown): boolean {
  return isRecord(value) && 'data' in value && 'success' in value;
}

function pathWithoutQuery(url?: string): string {
  const path = url?.split('?')[0] ?? '';
  return path.startsWith('http') ? new URL(path).pathname : path;
}

function isCollectionGet(response: AxiosResponse<unknown>): boolean {
  const method = response.config.method?.toUpperCase() ?? 'GET';
  const path = pathWithoutQuery(response.config.url);
  return method === 'GET' && COLLECTION_PATHS.some((collectionPath) => path === collectionPath);
}

function normalizeReportData(data: unknown) {
  if (isRecord(data) && Array.isArray(data.rows)) return data;
  if (Array.isArray(data)) {
    return { rows: data, generatedAt: new Date().toISOString() };
  }
  return { rows: data == null ? [] : [data], generatedAt: new Date().toISOString() };
}

function normalizeResponse(response: AxiosResponse<unknown>) {
  const data = normalizeNestedUsers(response.data);
  const path = pathWithoutQuery(response.config.url);

  if (response.status === 204 || data === '') {
    response.data = { data: undefined, message: 'No content', success: true };
    return response;
  }

  if (isApiResponse(data)) {
    response.data = data;
    return response;
  }

  if (isPaginated(data) && isRecord(data)) {
    response.data = normalizePaginated(data);
    return response;
  }

  if (path.startsWith('/reports/')) {
    response.data = { data: normalizeReportData(data), message: 'OK', success: true };
    return response;
  }

  if (Array.isArray(data) && isCollectionGet(response)) {
    response.data = paginated(data);
    return response;
  }

  response.data = { data, message: 'OK', success: true };
  return response;
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token && !tokenStorage.isGuestToken(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => normalizeResponse(response),
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const token = tokenStorage.getToken();
      if (!tokenStorage.isGuestToken(token)) {
        tokenStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
