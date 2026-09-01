import Link from "next/link";
import { Container, SectionTag } from "@/components/ui";
import type { ProductListItem } from "@/types/product";

/**
 * 구매 안내 섹션.
 *
 * ★ 라이즌푸드는 자사몰에서 직접 결제를 받는다 (2026-08-27 확정).
 *   레퍼런스 사이트는 "자사 결제 없음 → 외부 채널로만" 구조지만
 *   우리는 반대다. 자사몰이 주 채널이고 외부 채널은 보조다.
 *
 * B2B(대량구매·제휴)는 문의 폼으로 연결한다.
 */
export function BuyChannels({ primary }: { primary: ProductListItem | null }) {
  return (
    <section className="bg-cream-warm py-24 md:py-28" aria-labelledby="buy-heading">
      <Container>
        <SectionTag>Where to Buy</SectionTag>
        <h2
          id="buy-heading"
          className="font-kr text-3xl font-bold tracking-tight text-ink md:text-[30px]"
        >
          구매 안내
        </h2>
        <p className="mt-3 max-w-xl font-kr text-sm leading-relaxed text-ink-soft">
          공식몰에서 바로 주문하실 수 있습니다. 대량 구매와 제휴는 별도로 안내드립니다.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {/* 자사몰 — 주 채널이라 강조 */}
          <div className="flex flex-col rounded-[4px] border border-ink bg-ink p-7">
            <p className="font-en text-[11px] font-extrabold uppercase tracking-[0.2em] text-clay-soft">
              Official
            </p>
            <h3 className="mt-3 font-kr text-lg font-bold text-cream-warm">공식몰</h3>
            <p className="mt-2 flex-1 font-kr text-sm leading-relaxed text-cream-warm/70">
              전 라인업과 용량 옵션을 모두 취급합니다. 배송비 3,000원, 50,000원 이상 무료입니다.
            </p>
            {primary ? (
              <Link
                href={`/products/${primary.slug}`}
                className="mt-6 rounded-[2px] bg-cream-warm px-5 py-2.5 text-center font-kr text-sm font-bold text-ink transition hover:bg-paper"
              >
                바로 구매하기
              </Link>
            ) : (
              <Link
                href="/products"
                className="mt-6 rounded-[2px] bg-cream-warm px-5 py-2.5 text-center font-kr text-sm font-bold text-ink transition hover:bg-paper"
              >
                상품 보러 가기
              </Link>
            )}
          </div>

          {/* 외부 채널 — 상품별 구매 링크는 상세 페이지에 있다 */}
          <div className="flex flex-col rounded-[4px] border border-line bg-paper p-7">
            <p className="font-en text-[11px] font-extrabold uppercase tracking-[0.2em] text-clay-deep">
              Marketplace
            </p>
            <h3 className="mt-3 font-kr text-lg font-bold text-ink">입점 채널</h3>
            <p className="mt-2 flex-1 font-kr text-sm leading-relaxed text-ink-soft">
              네이버·쿠팡 등에서도 만나실 수 있습니다. 채널별 링크는 상품 상세에서 확인해 주세요.
            </p>
            <Link
              href="/products"
              className="mt-6 rounded-[2px] border border-ink px-5 py-2.5 text-center font-kr text-sm font-bold text-ink transition hover:bg-ink hover:text-cream-warm"
            >
              상품 상세 보기
            </Link>
          </div>

          {/* B2B */}
          <div className="flex flex-col rounded-[4px] border border-line bg-paper p-7">
            <p className="font-en text-[11px] font-extrabold uppercase tracking-[0.2em] text-clay-deep">
              B2B
            </p>
            <h3 className="mt-3 font-kr text-lg font-bold text-ink">대량구매 · 제휴</h3>
            <p className="mt-2 flex-1 font-kr text-sm leading-relaxed text-ink-soft">
              헬스장, 트레이너, 카페, 사내 복지 등 대량 구매와 브랜드 제휴는 별도 조건으로 안내드립니다.
            </p>
            <Link
              href="/inquiry"
              className="mt-6 rounded-[2px] border border-ink px-5 py-2.5 text-center font-kr text-sm font-bold text-ink transition hover:bg-ink hover:text-cream-warm"
            >
              제휴 문의하기
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
