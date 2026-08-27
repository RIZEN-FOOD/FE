import "server-only";

/**
 * 서버 컴포넌트에서 공개 API 를 부른다.
 *
 * 공개 페이지는 SEO 가 중요하다 (기획서 §11). 그래서 데이터를 서버에서 가져와
 * 완성된 HTML 을 내려보낸다. 브라우저 프록시(/api)가 아니라 API 서버를 직접 부른다.
 *
 * 인증이 필요 없는 공개 엔드포인트만 여기서 쓴다.
 */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8080";

type FetchOpts = {
  /** 재검증 주기(초). 상품·공지는 자주 바뀌지 않으니 짧게 캐시한다. */
  revalidate?: number;
};

async function getJson<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_ORIGIN}${path}`, {
      next: { revalidate: opts.revalidate ?? 60 },
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    // API 가 일시적으로 응답하지 않아도 페이지 자체는 떠야 한다.
    return null;
  }
}

export const serverApi = {
  getJson,
  origin: API_ORIGIN,
};
