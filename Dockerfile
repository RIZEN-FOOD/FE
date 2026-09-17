# syntax=docker/dockerfile:1
#
# 쇼핑몰 화면(Next.js) 운영 이미지. 서버(Lightsail)에서 docker compose 로 띄운다 (BE/deploy/).
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://www.도메인 -t ghcr.io/rizen-food/fe:latest .
#
# /api 요청은 앞단 Caddy 가 API 로 곧장 보낸다. 이 이미지는 화면만 그린다.
# 서버 컴포넌트는 실행 때 API_ORIGIN(내부 주소 http://api:8080)으로 API 를 부른다.

# ── 의존성 ────────────────────────────────────────────
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ── 빌드 ──────────────────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next.config 의 /api 중계 주소는 빌드 때 박힌다. 운영에선 Caddy 가 먼저 가로채지만 내부 주소로 맞춘다.
ARG API_ORIGIN=http://api:8080
# 사이트 공개 주소(sitemap·robots·공유 미리보기). 비어 있으면 localhost 로 박히므로 빌드를 멈춘다.
ARG NEXT_PUBLIC_SITE_URL
RUN test -n "$NEXT_PUBLIC_SITE_URL" || (echo "NEXT_PUBLIC_SITE_URL 빌드 인자가 필요합니다 (예: https://www.rizenfood.co.kr)" && exit 1)
ENV API_ORIGIN=$API_ORIGIN NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_TELEMETRY_DISABLED=1
# prebuild 가 public/assets 목록(src/generated/public-assets.json)을 다시 만든다.
RUN npm run build

# ── 실행 ──────────────────────────────────────────────
FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
RUN useradd --system --uid 10001 --no-create-home web
COPY --from=build --chown=web /app/.next/standalone ./
COPY --from=build --chown=web /app/.next/static ./.next/static
COPY --from=build --chown=web /app/public ./public
USER web
EXPOSE 3000
CMD ["node", "server.js"]
