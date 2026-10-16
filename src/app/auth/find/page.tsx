import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "아이디·비밀번호 찾기",
  robots: { index: false, follow: false },
};

/**
 * 아이디·비밀번호 찾기 — 임시 안내 (2026-10-16).
 *
 * 로그인 화면의 링크가 없는 주소(404)로 가고 있었다. 휴대폰 인증으로 재설정하는 기능을 만들기 전까지
 * 1:1 문의로 도와드린다고 안내한다. 간편 로그인(카카오·네이버) 회원은 비밀번호가 없다.
 */
export default function FindAccountPage() {
  return (
    <>
      <SiteHeader forceSolid />
      <main className="flex min-h-svh items-center justify-center bg-cream px-6 pb-16 pt-28">
        <div className="w-full max-w-[400px] rounded-none bg-paper p-8 shadow-[0_24px_70px_rgba(34,30,28,0.12)]">
          <div className="mb-6 flex justify-center">
            <BrandLogo className="h-8" />
          </div>
          <h1 className="text-center font-kr text-xl font-bold text-ink">아이디·비밀번호 찾기</h1>
          <p className="mt-4 font-kr text-sm leading-relaxed text-ink-soft">
            온라인으로 찾는 기능을 준비하고 있습니다. 그동안은 <b className="font-medium text-ink">1:1 문의</b>에
            가입하신 이름과 휴대폰 번호를 남겨 주시면 확인 후 도와드리겠습니다.
          </p>
          <p className="mt-3 font-kr text-sm leading-relaxed text-ink-soft">
            카카오·네이버로 가입하셨다면 비밀번호 없이 로그인 화면의 간편 로그인 버튼으로 들어오시면 됩니다.
          </p>
          <div className="mt-7 flex flex-col gap-2">
            <Button href="/inquiry" variant="dark" className="w-full">1:1 문의하기</Button>
            <Button href="/auth/login" variant="line" className="w-full">로그인으로 돌아가기</Button>
          </div>
        </div>
      </main>
    </>
  );
}
