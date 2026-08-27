"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { ProductDetail, ProductSaveRequest } from "@/types/product";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { cn } from "@/lib/cn";

/**
 * 상품 등록·수정 폼. 등록과 수정이 같은 화면을 쓴다.
 *
 * ★ 사용자는 비개발자다 (CLAUDE.md 규칙 4).
 *   - 전문용어를 쓰지 않는다. "슬러그" 대신 "주소에 쓸 영문 이름".
 *   - 이미지 칸마다 권장 크기 안내를 둔다.
 *   - 저장 전 미리보기를 제공한다.
 *
 * 숫자 칸은 문자열로 들고 있다가 저장할 때만 숫자로 바꾼다.
 * 빈 칸을 0 으로 만들지 않기 위해서다(가격 미입력과 0원은 다르다).
 */

type ImageSlot = { key: string; url: string; altText: string };

type FormState = {
  slug: string;
  nameKo: string;
  nameEn: string;
  subtitle: string;
  descriptionHtml: string;
  price: string;
  discountPrice: string;
  weightG: string;
  servings: string;
  stock: string;
  featured: boolean;
  visible: boolean;
  mainImage: ImageSlot | null;
  detailImages: ImageSlot[];
  nutrition: {
    servingSizeG: string;
    kcal: string;
    carbG: string;
    proteinG: string;
    fatG: string;
    sugarG: string;
    sodiumMg: string;
  };
  ingredients: { name: string; percentage: string; origin: string; allergen: string }[];
  label: {
    foodType: string;
    shelfLife: string;
    storageMethod: string;
    manufacturer: string;
    seller: string;
    customerService: string;
  };
  purchaseLinks: { channel: string; url: string; label: string }[];
};

const EMPTY: FormState = {
  slug: "",
  nameKo: "",
  nameEn: "",
  subtitle: "",
  descriptionHtml: "",
  price: "",
  discountPrice: "",
  weightG: "",
  servings: "",
  stock: "0",
  featured: false,
  visible: false,
  mainImage: null,
  detailImages: [],
  nutrition: { servingSizeG: "", kcal: "", carbG: "", proteinG: "", fatG: "", sugarG: "", sodiumMg: "" },
  ingredients: [],
  label: { foodType: "", shelfLife: "", storageMethod: "", manufacturer: "", seller: "", customerService: "" },
  purchaseLinks: [],
};

function fromDetail(d: ProductDetail): FormState {
  const main = d.images.find((i) => i.type === "MAIN");
  const details = d.images.filter((i) => i.type !== "MAIN");
  const num = (v: number | null) => (v == null ? "" : String(v));
  return {
    slug: d.slug,
    nameKo: d.nameKo,
    nameEn: d.nameEn ?? "",
    subtitle: d.subtitle ?? "",
    descriptionHtml: d.descriptionHtml ?? "",
    price: String(d.price),
    discountPrice: num(d.discountPrice),
    weightG: num(d.weightG),
    servings: num(d.servings),
    stock: String(d.stock),
    featured: d.featured,
    visible: d.visible,
    mainImage: main
      ? { key: main.baseKey, url: main.url, altText: main.altText ?? "" }
      : d.thumbnailKey
        ? { key: d.thumbnailKey, url: "", altText: "" }
        : null,
    detailImages: details.map((i) => ({ key: i.baseKey, url: i.url, altText: i.altText ?? "" })),
    nutrition: {
      servingSizeG: num(d.nutrition?.servingSizeG ?? null),
      kcal: num(d.nutrition?.kcal ?? null),
      carbG: num(d.nutrition?.carbG ?? null),
      proteinG: num(d.nutrition?.proteinG ?? null),
      fatG: num(d.nutrition?.fatG ?? null),
      sugarG: num(d.nutrition?.sugarG ?? null),
      sodiumMg: num(d.nutrition?.sodiumMg ?? null),
    },
    ingredients: d.ingredients.map((i) => ({
      name: i.name,
      percentage: i.percentage == null ? "" : String(i.percentage),
      origin: i.origin ?? "",
      allergen: i.allergen ?? "",
    })),
    label: {
      foodType: d.label?.foodType ?? "",
      shelfLife: d.label?.shelfLife ?? "",
      storageMethod: d.label?.storageMethod ?? "",
      manufacturer: d.label?.manufacturer ?? "",
      seller: d.label?.seller ?? "",
      customerService: d.label?.customerService ?? "",
    },
    purchaseLinks: d.purchaseLinks.map((l) => ({ channel: l.channel, url: l.url, label: l.label ?? "" })),
  };
}

export function ProductForm({
  mode,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  productId?: number;
  initial?: ProductDetail;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => (initial ? fromDetail(initial) : EMPTY));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toRequest(): ProductSaveRequest {
    const n = (v: string): number | null => (v.trim() === "" ? null : Number(v));
    const images = [
      ...(form.mainImage
        ? [{ imageKey: form.mainImage.key, altText: form.mainImage.altText || form.nameKo, type: "MAIN", sortOrder: 0 }]
        : []),
      ...form.detailImages.map((im, i) => ({
        imageKey: im.key,
        altText: im.altText || form.nameKo,
        type: "DETAIL",
        sortOrder: i + 1,
      })),
    ];

    const servingSize = n(form.nutrition.servingSizeG);
    const nutrition =
      servingSize != null
        ? {
            servingSizeG: servingSize,
            kcal: n(form.nutrition.kcal),
            carbG: n(form.nutrition.carbG),
            proteinG: n(form.nutrition.proteinG),
            fatG: n(form.nutrition.fatG),
            sugarG: n(form.nutrition.sugarG),
            sodiumMg: n(form.nutrition.sodiumMg),
          }
        : null;

    return {
      slug: form.slug.trim(),
      nameKo: form.nameKo.trim(),
      nameEn: form.nameEn.trim() || null,
      subtitle: form.subtitle.trim() || null,
      descriptionHtml: form.descriptionHtml || null,
      price: Number(form.price || 0),
      discountPrice: n(form.discountPrice),
      weightG: n(form.weightG),
      servings: n(form.servings),
      stock: n(form.stock) ?? 0,
      thumbnailKey: form.mainImage?.key ?? null,
      featured: form.featured,
      visible: form.visible,
      images,
      ingredients: form.ingredients
        .filter((i) => i.name.trim())
        .map((i, idx) => ({
          name: i.name.trim(),
          percentage: i.percentage.trim() === "" ? null : Number(i.percentage),
          origin: i.origin.trim() || null,
          allergen: i.allergen.trim() || null,
          sortOrder: idx,
        })),
      nutrition,
      label: {
        foodType: form.label.foodType.trim() || null,
        shelfLife: form.label.shelfLife.trim() || null,
        storageMethod: form.label.storageMethod.trim() || null,
        manufacturer: form.label.manufacturer.trim() || null,
        manufacturerAddr: null,
        seller: form.label.seller.trim() || null,
        sellerAddr: null,
        customerService: form.label.customerService.trim() || null,
        packageMaterial: null,
        extraNotice: null,
      },
      purchaseLinks: form.purchaseLinks
        .filter((l) => l.url.trim())
        .map((l, idx) => ({
          channel: l.channel,
          url: l.url.trim(),
          label: l.label.trim() || null,
          sortOrder: idx,
          visible: true,
        })),
    };
  }

  async function save() {
    setErrors({});
    setBanner(null);
    setSaving(true);
    try {
      const body = toRequest();
      if (mode === "create") {
        const res = await api.post<{ id: number }>("/api/admin/products", body);
        router.replace(`/admin/products/${res.id}`);
      } else {
        await api.put(`/api/admin/products/${productId}`, body);
        setBanner("저장되었습니다.");
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.fields) setErrors(e.fields);
        setBanner(e.message);
      } else {
        setBanner("저장 중 문제가 발생했습니다.");
      }
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-kr text-2xl font-bold text-ink">
          {mode === "create" ? "새 상품 등록" : "상품 수정"}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="rounded-[2px] border border-line px-4 py-2 font-kr text-sm text-ink transition hover:bg-clay-soft/40"
          >
            {preview ? "편집으로" : "미리보기"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-[2px] bg-ink px-5 py-2 font-kr text-sm font-bold text-cream-warm transition hover:bg-slate-deep disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {banner && (
        <p className="mt-4 rounded-[3px] bg-clay-soft/40 px-3 py-2 font-kr text-sm text-clay-deep">{banner}</p>
      )}

      {preview ? (
        <PreviewCard form={form} />
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {/* ── 기본 정보 ── */}
          <Section title="기본 정보">
            <Field label="상품명 (한글)" required error={errors.nameKo}>
              <Input value={form.nameKo} onChange={(v) => set("nameKo", v)} />
            </Field>
            <Field label="상품명 (영문)">
              <Input value={form.nameEn} onChange={(v) => set("nameEn", v)} />
            </Field>
            <Field label="주소에 쓸 영문 이름" hint="예: cream-of-rice · 영문 소문자·숫자·하이픈" required error={errors.slug}>
              <Input value={form.slug} onChange={(v) => set("slug", v)} placeholder="cream-of-rice" />
            </Field>
            <Field label="한 줄 설명">
              <Input value={form.subtitle} onChange={(v) => set("subtitle", v)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="가격 (원)" required error={errors.price}>
                <Input value={form.price} onChange={(v) => set("price", v)} inputMode="numeric" />
              </Field>
              <Field label="할인가 (원)" hint="없으면 비워둠">
                <Input value={form.discountPrice} onChange={(v) => set("discountPrice", v)} inputMode="numeric" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="용량 (g)">
                <Input value={form.weightG} onChange={(v) => set("weightG", v)} inputMode="numeric" />
              </Field>
              <Field label="제공 횟수">
                <Input value={form.servings} onChange={(v) => set("servings", v)} inputMode="numeric" />
              </Field>
              <Field label="재고" error={errors.stock}>
                <Input value={form.stock} onChange={(v) => set("stock", v)} inputMode="numeric" />
              </Field>
            </div>
          </Section>

          {/* ── 이미지 ── */}
          <Section title="이미지">
            <ImageUploader
              label="대표 이미지"
              hint="권장 1200×1200 (정사각형)"
              previewUrl={form.mainImage?.url ?? null}
              onChange={(key, url) => set("mainImage", { key, url, altText: "" })}
              onClear={() => set("mainImage", null)}
            />

            <div className="mt-6">
              <p className="font-kr text-sm font-medium text-ink">추가 이미지</p>
              <p className="font-kr text-xs text-ink-faint">권장 1200×1200 · 상세 갤러리에 순서대로 보입니다</p>
              <div className="mt-3 flex flex-col gap-3">
                {form.detailImages.map((im, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-16 w-16 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
                      {im.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={im.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => set("detailImages", form.detailImages.filter((_, idx) => idx !== i))}
                      className="font-kr text-xs text-ink-faint hover:text-clay-deep"
                    >
                      제거
                    </button>
                  </div>
                ))}
                <ImageUploader
                  label=""
                  hint="추가로 올리기"
                  previewUrl={null}
                  onChange={(key, url) => set("detailImages", [...form.detailImages, { key, url, altText: "" }])}
                />
              </div>
            </div>
          </Section>

          {/* ── 영양성분 ── */}
          <Section title="영양성분" note="법정 표시사항입니다. 확인된 값만 입력하세요.">
            <Field label="1회 제공량 (g)" hint="입력하면 영양성분이 저장됩니다">
              <Input value={form.nutrition.servingSizeG} onChange={(v) => set("nutrition", { ...form.nutrition, servingSizeG: v })} inputMode="numeric" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="열량 (kcal)"><Input value={form.nutrition.kcal} onChange={(v) => set("nutrition", { ...form.nutrition, kcal: v })} inputMode="numeric" /></Field>
              <Field label="탄수화물 (g)"><Input value={form.nutrition.carbG} onChange={(v) => set("nutrition", { ...form.nutrition, carbG: v })} inputMode="numeric" /></Field>
              <Field label="단백질 (g)"><Input value={form.nutrition.proteinG} onChange={(v) => set("nutrition", { ...form.nutrition, proteinG: v })} inputMode="numeric" /></Field>
              <Field label="지방 (g)"><Input value={form.nutrition.fatG} onChange={(v) => set("nutrition", { ...form.nutrition, fatG: v })} inputMode="numeric" /></Field>
              <Field label="당류 (g)"><Input value={form.nutrition.sugarG} onChange={(v) => set("nutrition", { ...form.nutrition, sugarG: v })} inputMode="numeric" /></Field>
              <Field label="나트륨 (mg)"><Input value={form.nutrition.sodiumMg} onChange={(v) => set("nutrition", { ...form.nutrition, sodiumMg: v })} inputMode="numeric" /></Field>
            </div>
          </Section>

          {/* ── 원재료 · 표시사항 ── */}
          <Section title="원재료 · 표시사항" note="법정 표시사항입니다. 텍스트로 저장됩니다.">
            <p className="font-kr text-sm font-medium text-ink">원재료</p>
            <div className="mt-2 flex flex-col gap-2">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_1fr_auto] gap-2">
                  <Input value={ing.name} onChange={(v) => updateArray(form, set, "ingredients", i, { name: v })} placeholder="원재료명" />
                  <Input value={ing.percentage} onChange={(v) => updateArray(form, set, "ingredients", i, { percentage: v })} placeholder="%" inputMode="numeric" />
                  <Input value={ing.origin} onChange={(v) => updateArray(form, set, "ingredients", i, { origin: v })} placeholder="원산지" />
                  <button type="button" onClick={() => set("ingredients", form.ingredients.filter((_, idx) => idx !== i))} className="font-kr text-xs text-ink-faint hover:text-clay-deep">제거</button>
                </div>
              ))}
              <button type="button" onClick={() => set("ingredients", [...form.ingredients, { name: "", percentage: "", origin: "", allergen: "" }])} className="self-start font-kr text-xs font-medium text-clay-deep">+ 원재료 추가</button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="식품유형"><Input value={form.label.foodType} onChange={(v) => set("label", { ...form.label, foodType: v })} /></Field>
              <Field label="소비기한"><Input value={form.label.shelfLife} onChange={(v) => set("label", { ...form.label, shelfLife: v })} /></Field>
              <Field label="보관방법"><Input value={form.label.storageMethod} onChange={(v) => set("label", { ...form.label, storageMethod: v })} /></Field>
              <Field label="제조원"><Input value={form.label.manufacturer} onChange={(v) => set("label", { ...form.label, manufacturer: v })} /></Field>
              <Field label="판매원"><Input value={form.label.seller} onChange={(v) => set("label", { ...form.label, seller: v })} /></Field>
              <Field label="소비자상담실"><Input value={form.label.customerService} onChange={(v) => set("label", { ...form.label, customerService: v })} /></Field>
            </div>
          </Section>

          {/* ── 상세 설명 ── */}
          <Section title="상세 설명">
            <RichTextEditor value={form.descriptionHtml} onChange={(html) => set("descriptionHtml", html)} />
          </Section>

          {/* ── 구매 링크 ── */}
          <Section title="구매 링크" note="외부 판매 채널로 연결합니다.">
            <div className="flex flex-col gap-2">
              {form.purchaseLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-[100px_1fr_auto] gap-2">
                  <select
                    value={link.channel}
                    onChange={(e) => updateArray(form, set, "purchaseLinks", i, { channel: e.target.value })}
                    className="rounded-[3px] border border-line bg-cream-warm px-2 py-2 font-kr text-sm outline-none focus:border-clay-deep"
                  >
                    <option value="NAVER">네이버</option>
                    <option value="COUPANG">쿠팡</option>
                    <option value="OWN">자사몰</option>
                    <option value="OTHER">기타</option>
                  </select>
                  <Input value={link.url} onChange={(v) => updateArray(form, set, "purchaseLinks", i, { url: v })} placeholder="https://..." />
                  <button type="button" onClick={() => set("purchaseLinks", form.purchaseLinks.filter((_, idx) => idx !== i))} className="font-kr text-xs text-ink-faint hover:text-clay-deep">제거</button>
                </div>
              ))}
              <button type="button" onClick={() => set("purchaseLinks", [...form.purchaseLinks, { channel: "NAVER", url: "", label: "" }])} className="self-start font-kr text-xs font-medium text-clay-deep">+ 구매 링크 추가</button>
            </div>
          </Section>

          {/* ── 노출 설정 ── */}
          <Section title="노출 설정">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 accent-ink" />
              <span className="font-kr text-sm text-ink">사이트에 노출</span>
            </label>
            <label className="mt-2 flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-ink" />
              <span className="font-kr text-sm text-ink">메인 페이지에 노출 (★)</span>
            </label>
          </Section>
        </div>
      )}
    </div>
  );
}

/* ── 하위 컴포넌트 ── */

function updateArray<K extends "ingredients" | "purchaseLinks">(
  form: FormState,
  set: <F extends keyof FormState>(key: F, value: FormState[F]) => void,
  key: K,
  index: number,
  patch: Partial<FormState[K][number]>,
) {
  const next = form[key].map((row, i) => (i === index ? { ...row, ...patch } : row));
  set(key, next as FormState[K]);
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[4px] border border-line bg-paper px-5 py-5">
      <h2 className="font-kr text-base font-bold text-ink">{title}</h2>
      {note && <p className="mt-0.5 font-kr text-xs text-ink-faint">{note}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {label && (
        <span className="flex items-baseline justify-between">
          <span className="font-kr text-sm font-medium text-ink">
            {label}
            {required && <span className="ml-0.5 text-clay-deep">*</span>}
          </span>
          {hint && <span className="font-kr text-xs text-ink-faint">{hint}</span>}
        </span>
      )}
      <div className={label ? "mt-1.5" : ""}>{children}</div>
      {error && <p className="mt-1 font-kr text-xs text-clay-deep">{error}</p>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[3px] border border-line bg-cream-warm px-3 py-2 font-kr text-sm outline-none focus:border-clay-deep"
    />
  );
}

/** 저장 전 미리보기 — 입력한 내용을 요약해 보여준다. */
function PreviewCard({ form }: { form: FormState }) {
  const price = Number(form.price || 0);
  const discount = form.discountPrice.trim() === "" ? null : Number(form.discountPrice);
  return (
    <div className="mt-6 rounded-[4px] border border-line bg-paper p-6">
      <div className="flex gap-5">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-[3px] border border-line bg-cream-warm">
          {form.mainImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.mainImage.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-kr text-xs text-ink-faint">이미지 없음</div>
          )}
        </div>
        <div className="min-w-0">
          <p className={cn("font-kr text-xs", form.visible ? "text-ink-faint" : "text-clay-deep")}>
            {form.visible ? "노출 중" : "숨김 상태 — 저장해도 사이트에 안 보입니다"}
          </p>
          <h3 className="mt-1 font-kr text-xl font-bold text-ink">{form.nameKo || "(상품명 없음)"}</h3>
          {form.subtitle && <p className="mt-1 font-kr text-sm text-ink-soft">{form.subtitle}</p>}
          <p className="mt-3 font-numeric text-2xl font-bold text-ink">
            {(discount ?? price).toLocaleString("ko-KR")}
            <span className="ml-1 font-kr text-base font-medium">원</span>
            {discount != null && (
              <span className="ml-2 font-numeric text-base font-normal text-ink-faint line-through">
                {price.toLocaleString("ko-KR")}
              </span>
            )}
          </p>
        </div>
      </div>

      {form.descriptionHtml && (
        <div
          className="mt-6 border-t border-line pt-4 font-kr text-sm leading-relaxed text-ink [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: form.descriptionHtml }}
        />
      )}

      <p className="mt-6 font-kr text-xs text-ink-faint">
        이 화면은 미리보기입니다. 저장해야 실제로 반영됩니다.
      </p>
    </div>
  );
}
