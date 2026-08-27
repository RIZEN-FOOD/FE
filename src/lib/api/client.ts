/**
 * API 호출 래퍼.
 *
 * 인증은 HttpOnly 쿠키로 오간다. 토큰을 코드가 만지지 않는다.
 * credentials: "include" 로 매 요청에 쿠키가 실리게 한다.
 *
 * 서버는 실패 시 { error, message, fields? } 형태로 응답한다 (ApiExceptionHandler).
 * 그 message 는 사용자에게 그대로 보여줄 수 있는 문장이다.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** 검증 실패 시 칸별 메시지 */
  readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type Json = Record<string, unknown>;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json; charset=UTF-8" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? (JSON.parse(text) as Json) : {};

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data.error as string) ?? "ERROR",
      (data.message as string) ?? "요청을 처리하지 못했습니다.",
      data.fields as Record<string, string> | undefined,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

/**
 * 파일 업로드. Content-Type 을 직접 지정하지 않는다.
 * FormData 를 주면 브라우저가 boundary 를 포함해 알아서 넣는다.
 */
export async function uploadImage(
  file: File,
  category: string,
): Promise<{ key: string; width: number; height: number; urls: Record<string, string> }> {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);

  const res = await fetch("/api/admin/images", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "ERROR", data.message ?? "업로드에 실패했습니다.");
  }
  return data;
}
