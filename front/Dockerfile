# 빌드 스테이지
FROM node:alpine3.18 as build

# 작업 디렉토리 설정
WORKDIR /app

# package.json 파일과 의존성 설치
COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

# 나머지 소스코드 복사 및 빌드
COPY . .
RUN npm run build

# 최종 실행 이미지 (Nginx)
FROM nginx:1.23-alpine

# Nginx 설정 디렉토리 설정
WORKDIR /usr/share/nginx/html

# 기존 Nginx 기본 파일 삭제
RUN rm -rf ./*

# 빌드된 정적 파일만 복사
COPY --from=build /app/build .

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 설정
EXPOSE 80

# Nginx 데몬 실행
ENTRYPOINT ["nginx", "-g", "daemon off;"]
