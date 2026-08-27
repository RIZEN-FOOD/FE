import type { IngredientKind } from "./ingredients";

/**
 * 재료를 캔버스에 그린다.
 *
 * 실사진(누끼)이 없는 동안 쓰는 대체 도형이다.
 * 모양이 정교할 필요는 없다. 여기서 확인하려는 건 생김새가 아니라
 * 낙하의 리듬 — 속도차, 회전, 깊이감 — 이기 때문이다.
 *
 * sprite 가 준비되면 PourColumn 이 이 함수 대신 drawImage 를 쓴다.
 */
export function drawIngredient(
  ctx: CanvasRenderingContext2D,
  kind: IngredientKind,
  r: number,
) {
  switch (kind) {
    case "blueberry": {
      ctx.fillStyle = "#35406B";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // 위쪽 광택
      ctx.fillStyle = "rgba(255,255,255,0.30)";
      ctx.beginPath();
      ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.32, r * 0.2, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // 꼭지의 별 모양 홈
      ctx.strokeStyle = "rgba(20,26,50,0.85)";
      ctx.lineWidth = Math.max(1, r * 0.12);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.34, Math.sin(a) * r * 0.34);
      }
      ctx.stroke();
      break;
    }

    case "almond": {
      ctx.fillStyle = "#C89B6A";
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.62, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.ellipse(-r * 0.16, -r * 0.2, r * 0.2, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "walnut": {
      ctx.fillStyle = "#A87C4F";
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.92, r * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();
      // 호두 특유의 주름
      ctx.strokeStyle = "rgba(90,60,35,0.55)";
      ctx.lineWidth = Math.max(1, r * 0.1);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(0, i * r * 0.3, r * 0.7, r * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case "banana": {
      // 바나나 슬라이스 (원형 단면)
      ctx.fillStyle = "#F3E4B4";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#DFCB92";
      ctx.lineWidth = Math.max(1, r * 0.14);
      ctx.stroke();
      // 가운데 씨 자국
      ctx.fillStyle = "rgba(160,140,90,0.55)";
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.24, Math.sin(a) * r * 0.24, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "powder":
    default: {
      ctx.fillStyle = "#FFFDF9";
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}
