# 빌드 스테이지
FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN ls -all

# 최종 스테이지
FROM amazon/aws-lambda-nodejs
# FROM public.ecr.aws/lambda/nodejs:18

# # 빌드 스테이지에서 생성된 빌드 아티팩트와 .env 파일 복사
COPY --from=builder /app/dist /var/task/dist
COPY --from=builder /app/node_modules /var/task/node_modules
COPY --from=builder /app/.env /var/task/.env
# Lambda 핸들러 설정
CMD ["dist/main.handler"]

