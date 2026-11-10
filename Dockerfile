FROM node:22-alpine3.22 AS build

WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:all

FROM node:22-alpine3.22 AS runtime

ENV NODE_ENV=production
ENV PORT=8787
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

EXPOSE 8787
USER node
ENTRYPOINT ["node", "dist-server/index.js"]
