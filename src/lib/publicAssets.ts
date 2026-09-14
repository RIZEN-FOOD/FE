import manifest from "@/generated/public-assets.json";

/**
 * public/assets 에 실제로 있는 파일인지 확인한다.
 *
 * 목록은 빌드·개발 서버 시작 때 scripts/gen-public-assets.mjs 가 만든다.
 * 실행 중에 파일 시스템(node:fs)을 읽지 않으므로 Node 서버와 Cloudflare Workers
 * 어디서 돌아도 똑같이 동작한다.
 */
const files = new Set<string>(manifest);

export function hasPublicAsset(src: string): boolean {
  return files.has(src);
}
