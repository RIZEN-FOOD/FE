import { CouponForm } from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="font-kr text-2xl font-bold text-ink">할인코드 등록</h1>
      <p className="mt-1 font-kr text-sm text-ink-soft">
        손님이 결제 화면에서 직접 입력할 코드를 만듭니다. 켜기 전까지는 아무도 쓸 수 없습니다.
      </p>
      <CouponForm />
    </div>
  );
}
