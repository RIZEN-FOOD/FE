# 메인 화면 이미지 자산

넣는 위치에 따라 자동으로 코드에 연결된다.

## ingredients/  — 낙하 재료 (AI 생성)
투명 배경 PNG, 정사각형, 그림자 없이, 여백 최소. 1024×1024 권장.
파일명 그대로:
  blueberry.png  almond.png  walnut.png  banana.png
→ src/components/hero/layers/ingredients.ts 의 sprite 경로에 연결

## hero/  — 제품 (실촬영 누끼)
투명 배경 PNG.
  product.png    패키지 정면 (세로형, 1200×1600 권장)
  bowl.png       빈 그릇 (살짝 위에서)
  finished.png   완성 그릇 3/4 컷
→ 각 Placeholder 컴포넌트에서 교체

## bg/  — 배경·분위기 (AI 생성)
가로로 넓게, 1920×1080 이상.
  hero-bg.jpg    클레이 톤 배경 (선택)
