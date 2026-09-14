// public/assets 아래 파일 목록을 src/generated/public-assets.json 으로 만든다.
//
// 왜: Cloudflare Workers 에서는 public 폴더를 파일 시스템(node:fs)으로 읽을 수 없다.
//     "사진 파일이 있으면 그걸 쓰고 없으면 대체 사진" 판단을 실행 중에 하지 않고,
//     빌드·개발 서버 시작 때 만든 목록으로 한다. Node 로 띄워도 똑같이 동작한다.
//
// npm 의 predev / prebuild 가 자동으로 실행한다. 사진을 넣고 dev·build 를 다시 돌리면 반영된다.
import { readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const publicDir = join(root, "public");
const scanDir = join(publicDir, "assets");
const outFile = join(root, "src", "generated", "public-assets.json");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push("/" + relative(publicDir, full).split(sep).join("/"));
  }
  return out;
}

const files = walk(scanDir).sort();
mkdirSync(join(root, "src", "generated"), { recursive: true });
writeFileSync(outFile, JSON.stringify(files, null, 2) + "\n");
console.log(`public-assets: ${files.length} files → src/generated/public-assets.json`);
