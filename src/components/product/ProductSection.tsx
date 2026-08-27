import { Button, Card, Container, SectionTag } from "@/components/ui";
import { ProductPlaceholder } from "@/components/hero/layers/ProductPlaceholder";
import { placeholderProduct } from "@/lib/placeholderProduct";

/**
 * 히어로가 끝난 뒤 나오는 상품 섹션.
 *
 * 시네마틱 연출을 끝까지 본 사람이 바로 구매로 이어질 수 있는 자리다.
 * 여기까지 오지 않아도 하단 고정 바로 언제든 빠져나갈 수 있다.
 *
 * ⚠️ 지금은 임시 데이터를 쓴다. 상품 API 가 생기면 서버에서 받아온다.
 *    상품을 코드에 하드코딩하지 않는다 (CLAUDE.md 규칙 3).
 */
export function ProductSection() {
  const product = placeholderProduct;

  // TODO: shipping_policy 테이블에서 읽어온다. 지금은 승인받은 값 그대로.
  const shipping = { baseFee: 3000, freeThreshold: 50000 };

  return (
    <section className="bg-cream py-24 md:py-32" aria-labelledby="product-heading">
      <Container>
        <SectionTag>Product</SectionTag>
        <h2
          id="product-heading"
          className="font-kr text-[clamp(1.9rem,3.4vw,3rem)] font-bold leading-tight tracking-tight"
        >
          지금 주문할 수 있습니다
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-center">
          {/* 대표 이미지 — 실사진이 오면 next/image 로 교체한다 */}
          <div className="flex items-center justify-center rounded-[3px] bg-clay-soft/60 py-14">
            <ProductPlaceholder className="h-[46vmin] max-h-[380px] w-auto drop-shadow-[0_22px_38px_rgba(90,60,40,0.28)]" />
          </div>

          <div>
            <h3 className="font-kr text-2xl font-bold">{product.nameKo}</h3>
            <p className="mt-2 text-ink-soft">곱게 도정한 쌀 100%. 물이나 우유에 풀어 드세요.</p>

            <p className="mt-6 font-numeric text-4xl font-bold">
              {product.price.toLocaleString("ko-KR")}
              <span className="ml-1 font-kr text-xl font-medium">원</span>
            </p>

            <p className="mt-2 text-sm text-ink-soft">
              배송비 {shipping.baseFee.toLocaleString("ko-KR")}원 ·{" "}
              {shipping.freeThreshold.toLocaleString("ko-KR")}원 이상 구매 시 무료
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/products/${product.slug}`} variant="dark">
                구매하기
              </Button>
              <Button href={`/products/${product.slug}`} variant="line">
                상세 정보 보기
              </Button>
            </div>

            {/*
              법정 표시사항은 이미지가 아니라 텍스트로 넣는다 (CLAUDE.md 규칙 2).
              실제 수치는 아직 확보되지 않았다. 지어내지 않고 자리만 잡아둔다.
              product_label · nutrition · ingredient 테이블에서 채운다.
            */}
            <Card className="mt-10">
              <p className="font-en text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-clay-deep">
                표시사항
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["식품유형", "제품 정보 확인 후 표기"],
                  ["원재료명 및 함량", "제품 정보 확인 후 표기"],
                  ["내용량", "1kg"],
                  ["영양성분", "제품 정보 확인 후 표기"],
                  ["소비기한", "제품 정보 확인 후 표기"],
                  ["보관방법", "제품 정보 확인 후 표기"],
                  ["제조원 / 판매원", "제품 정보 확인 후 표기"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <dt className="w-32 shrink-0 text-ink-faint">{label}</dt>
                    <dd className="text-ink-soft">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                이미지는 연출된 것으로 실제 제품과 다를 수 있습니다. 토핑은 제품에 포함되지 않습니다.
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
