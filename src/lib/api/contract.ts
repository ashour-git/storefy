export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'IDEMPOTENCY_CONFLICT'
  | 'IN_PROGRESS'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export function fail(code: ApiErrorCode, message: string, status: number, details?: unknown): Response {
  const body: ApiErrorBody = details === undefined
    ? { error: { code, message } }
    : { error: { code, message, details } };
  return Response.json(body, { status });
}

export function ok<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function parsePagination(url: string, defaults = { page: 1, pageSize: 20 }): { page: number; pageSize: number } {
  try {
    const params = new URL(url).searchParams;
    const page = Math.max(1, Math.min(1000, Number(params.get('page')) || defaults.page));
    const pageSize = Math.max(1, Math.min(100, Number(params.get('pageSize')) || defaults.pageSize));
    return { page, pageSize };
  } catch {
    return { ...defaults };
  }
}

export function paginate<T>(items: T[], totalItems: number, page: number, pageSize: number): { data: T[]; pagination: Pagination } {
  return {
    data: items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

export function getIdempotencyKey(request: Request, bodyKey?: unknown): string | null {
  const header = request.headers.get('idempotency-key') || request.headers.get('x-idempotency-key');
  if (typeof header === 'string' && header.length >= 12 && header.length <= 128) return header;
  if (typeof bodyKey === 'string' && bodyKey.length >= 12 && bodyKey.length <= 128) return bodyKey;
  return null;
}

export async function hashRequest(value: unknown): Promise<string> {
  const text = JSON.stringify(value);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export function isUniqueViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unique|duplicate|23505/i.test(message);
}

export function toPublicError(error: unknown): string {
  if (process.env.NODE_ENV !== 'production') {
    return error instanceof Error ? error.message.slice(0, 200) : 'Unexpected error';
  }
  return 'Internal error';
}
