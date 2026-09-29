import type { Metadata } from "next";
import { InquiryForm } from "@/components/store/InquiryForm";

export const metadata: Metadata = {
  title: "문의하기",
  description: "라이즌푸드에 궁금한 점을 문의해 주세요.",
  alternates: { canonical: "/inquiry" },
};

export default function InquiryPage() {
  return <InquiryForm />;
}
