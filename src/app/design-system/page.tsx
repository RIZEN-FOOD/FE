import type { Metadata } from "next";
import { Button, Card, Container, SectionTag } from "@/components/ui";

export const metadata: Metadata = {
  title: "디자인 토큰",
  // 내부 확인용 페이지라 검색에 잡히지 않게 한다.
  robots: { index: false, follow: false },
};

/**
 * 팔레트와 공용 컴포넌트 확인용 내부 페이지.
 * 새 컴포넌트를 만들 때 여기에 추가해두면 한눈에 비교할 수 있다.
 */
const palette = [
  { name: "clay", hex: "#DEB191", className: "bg-clay" },
  { name: "clay-deep", hex: "#B87F5D", className: "bg-clay-deep" },
  { name: "clay-soft", hex: "#E8C4A6", className: "bg-clay-soft" },
  { name: "cream", hex: "#F4EFE6", className: "bg-cream" },
  { name: "cream-warm", hex: "#FAF7F1", className: "bg-cream-warm" },
  { name: "paper", hex: "#FFFDF9", className: "bg-paper" },
  { name: "ink", hex: "#221E1C", className: "bg-ink" },
  { name: "ink-soft", hex: "#5A524C", className: "bg-ink-soft" },
  { name: "ink-faint", hex: "#9A8E85", className: "bg-ink-faint" },
  { name: "slate", hex: "#4F5660", className: "bg-slate" },
  { name: "slate-deep", hex: "#383E47", className: "bg-slate-deep" },
  { name: "berry", hex: "#35406B", className: "bg-berry" },
];

export default function DesignSystemPage() {
  return (
    <main className="py-20">
      <Container>
        <SectionTag>Design System</SectionTag>
        <h1 className="font-kr text-4xl font-bold tracking-tight">디자인 토큰</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          내부 확인용 페이지입니다. 값은 <code>src/app/globals.css</code> 의 @theme 에서만 정의합니다.
        </p>

        <section className="mt-14">
          <SectionTag>Palette</SectionTag>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {palette.map((c) => (
              <li key={c.name}>
                <div className={`h-20 rounded-[3px] border border-line ${c.className}`} />
                <p className="mt-2 font-en text-xs font-semibold">{c.name}</p>
                <p className="font-numeric text-xs text-ink-faint">{c.hex}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <SectionTag>Typography</SectionTag>
          <div className="space-y-2">
            <p className="font-en text-2xl font-extrabold">Archivo — 영문·숫자 1234567890</p>
            <p className="font-kr text-2xl font-bold">Noto Sans KR — 크림오브라이스</p>
            <p className="font-script text-3xl text-clay-deep">Kaushan Script — Rizen Food</p>
          </div>
        </section>

        <section className="mt-14">
          <SectionTag>Components</SectionTag>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="dark">구매하기</Button>
            <Button variant="line">자세히 보기</Button>
            <Button variant="dark" size="sm">작은 버튼</Button>
            <Button variant="line" size="sm" href="/products">링크 버튼</Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card interactive>
              <p className="font-en text-xs font-extrabold tracking-widest text-clay-deep">01</p>
              <h2 className="mt-2 font-kr text-lg font-bold">쌀 100%</h2>
              <p className="mt-1 text-sm text-ink-soft">곱게 도정한 쌀로만 만들었습니다.</p>
            </Card>
            <Card interactive>
              <p className="font-en text-xs font-extrabold tracking-widest text-clay-deep">02</p>
              <h2 className="mt-2 font-kr text-lg font-bold">물만 부으면</h2>
              <p className="mt-1 text-sm text-ink-soft">물이나 우유에 풀어 드세요.</p>
            </Card>
            <Card interactive>
              <p className="font-en text-xs font-extrabold tracking-widest text-clay-deep">03</p>
              <h2 className="mt-2 font-kr text-lg font-bold">90초</h2>
              <p className="mt-1 text-sm text-ink-soft">준비에 오래 걸리지 않습니다.</p>
            </Card>
          </div>
        </section>

        <section className="mt-14 rounded-[3px] bg-slate-deep px-7 py-10">
          <SectionTag tone="onDark">On Dark</SectionTag>
          <p className="font-kr text-lg text-cream-warm">
            다크 섹션에서는 SectionTag 의 tone 을 onDark 로 바꿉니다.
          </p>
        </section>
      </Container>
    </main>
  );
}
