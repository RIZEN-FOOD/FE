/**
 * 나이스페이 결제창 SDK.
 *
 * 결제창은 나이스가 내려주는 스크립트가 띄운다. 우리가 미리 받아둘 수 없고(버전이 바뀐다),
 * 결제 화면에 들어온 사람에게만 필요하므로 **누를 때 한 번** 받아온다.
 *
 * ★ Server 승인 모델이라 결제창에서 인증이 끝나면 나이스가 우리 서버(returnUrl)로 POST 한다.
 *   그래서 여기에는 "성공 콜백"이 없다 — 브라우저가 그대로 우리 서버로 넘어간다.
 *   실패·창 닫기만 fnError 로 돌아온다.
 */
const SDK_URL = "https://pay.nicepay.co.kr/v1/js/";

export type NicePayRequest = {
  clientId: string;
  method: string;
  orderId: string;
  amount: number;
  goodsName: string;
  returnUrl: string;
  buyerName?: string;
  buyerTel?: string;
  buyerEmail?: string;
  fnError?: (result: { errorMsg?: string; resultMsg?: string }) => void;
};

declare global {
  interface Window {
    AUTHNICE?: { requestPay: (options: NicePayRequest) => void };
  }
}

let loading: Promise<void> | null = null;

export function loadNicePaySdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 쓸 수 있습니다."));
  }
  if (window.AUTHNICE) {
    return Promise.resolve();
  }
  // 같은 순간에 여러 번 눌러도 스크립트는 한 번만 받는다.
  if (loading) {
    return loading;
  }
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null; // 다음에 다시 시도할 수 있게
      reject(new Error("결제창을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."));
    };
    document.head.appendChild(script);
  });
  return loading;
}
