import type { Metadata } from "next";

import { PolicyPage, Pending } from "@/components/policy/PolicyPage";
import { serverApi } from "@/lib/server/api";

export const metadata: Metadata = {
  title: "배송·교환·환불 안내",
  description: "라이즌푸드 배송비, 배송 기간, 청약철회·교환·반품·환불 안내입니다.",
};

const EFFECTIVE = "2026년 9월 2일";

type Shipping = { baseFee?: number; freeThreshold?: number; islandExtraFee?: number };

/**
 * 배송·교환·환불 안내. 전자상거래법상 청약철회·배송/교환/환불 정책 게시 의무.
 *
 * ★ 배송비 숫자는 shipping_policy 에서 읽는다(코드에 박지 않음).
 *   식품은 청약철회 제한 사유가 있으므로 명시한다(전자상거래법 §17②).
 */
export default async function ShippingPolicyPage() {
  const s = (await serverApi.getJson<Shipping>("/api/shipping-policy")) ?? {};
  const settings = (await serverApi.getJson<Record<string, string>>("/api/settings")) ?? {};
  const won = (n?: number) => (typeof n === "number" ? n.toLocaleString("ko-KR") + "원" : null);

  const baseFee = won(s.baseFee);
  const freeThreshold = won(s.freeThreshold);
  const island = won(s.islandExtraFee);
  const cutoff = settings["order.cutoff_time"]?.trim();
  const cs = settings["company.tel"]?.trim();

  return (
    <PolicyPage title="배송·교환·환불 안내" effectiveDate={EFFECTIVE}>
      <h2>1. 배송 안내</h2>
      <ul>
        <li>
          배송 방법: 택배 (배송업체 <Pending />)
        </li>
        <li>
          배송비: 기본 {baseFee ?? <Pending />}
          {freeThreshold ? <>, {freeThreshold} 이상 구매 시 무료</> : null}
        </li>
        {island && Number(s.islandExtraFee) > 0 ? (
          <li>도서·산간 지역은 배송비 {island}가 추가될 수 있습니다.</li>
        ) : (
          <li>도서·산간 지역은 배송비가 추가될 수 있습니다.</li>
        )}
        <li>
          배송 기간: 결제 확인 후 통상 2~3영업일 이내 출고
          {cutoff ? <> (평일 {cutoff} 이전 결제 건 당일 출고 기준)</> : null}. 주말·공휴일은
          출고가 지연될 수 있습니다.
        </li>
      </ul>
      <p>
        신선·가공식품 특성상 기상 상황이나 주문 폭주 시 배송이 지연될 수 있으며, 이 경우 개별
        안내드립니다.
      </p>

      <h2>2. 교환 및 반품 (청약철회)</h2>
      <h3>신청 기간</h3>
      <p>
        「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 상품을 공급받은 날부터{" "}
        <strong>7일 이내</strong> 청약철회(교환·반품)를 신청하실 수 있습니다. 표시·광고와 다르거나
        계약과 다르게 이행된 경우, 그 사실을 안 날 또는 알 수 있었던 날부터 30일 이내(공급받은 날부터
        3개월 이내)에 신청하실 수 있습니다.
      </p>
      <h3>신청 방법</h3>
      <p>
        마이페이지 &gt; 주문 내역 또는 고객센터
        {cs ? <>({cs})</> : null}·<a href="/inquiry">1:1 문의</a>로 신청해 주세요. 요청 시각과 처리
        결과는 기록·안내됩니다.
      </p>

      <h3>교환·반품이 제한되는 경우</h3>
      <p>다음의 경우에는 교환·반품이 어렵습니다 (전자상거래법 제17조 제2항).</p>
      <ul>
        <li>고객의 책임 있는 사유로 상품이 멸실·훼손된 경우</li>
        <li>고객의 사용 또는 일부 소비로 상품의 가치가 현저히 감소한 경우</li>
        <li>
          <strong>식품 특성상</strong> 포장을 개봉하여 섭취했거나, 개봉으로 재판매가 곤란할 정도로
          가치가 감소한 경우
        </li>
        <li>시간이 지나 재판매가 곤란할 정도로 상품 가치가 현저히 감소한 경우</li>
      </ul>
      <p>
        다만 상품의 내용이 표시·광고와 다르거나 하자·오배송인 경우에는 위 제한과 관계없이 교환·반품이
        가능합니다.
      </p>

      <h3>반품 배송비</h3>
      <ul>
        <li>단순 변심에 의한 교환·반품: 왕복 배송비는 고객 부담입니다.</li>
        <li>상품 하자·오배송에 의한 교환·반품: 배송비는 회사가 부담합니다.</li>
      </ul>

      <h2>3. 환불 안내</h2>
      <p>
        반품 상품 회수 및 확인이 완료되면 영업일 기준 3일 이내에 환불 처리합니다. 결제 수단에 따라
        환불 방식과 소요 기간이 다를 수 있으며, 카드 결제의 경우 카드사 정책에 따라 승인 취소까지 추가
        시일이 소요될 수 있습니다.
      </p>

      <h2>4. 문의</h2>
      <p>
        배송·교환·환불에 관한 문의는 고객센터{cs ? <>({cs})</> : <> (<Pending />)</>} 또는{" "}
        <a href="/inquiry">1:1 문의</a>를 이용해 주세요.
      </p>
    </PolicyPage>
  );
}
