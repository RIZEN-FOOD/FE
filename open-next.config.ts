// Cloudflare Workers 용 OpenNext 설정.
//
// 공개 페이지는 API 응답을 10초 캐시한다(src/lib/server/api.ts). Workers 에서 이 캐시가
// 지금(Node)과 똑같이 동작하려면 저장소(R2)와 재검증 큐(Durable Object)가 필요하다.
// 설정하지 않으면 페이지는 뜨지만 매 요청마다 API 를 새로 불러 서버 부담이 커진다.
//
// revalidateTag / revalidatePath 를 쓰지 않으므로 태그 캐시(D1)는 두지 않는다.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
});
