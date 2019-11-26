FROM node:current-alpine AS base
LABEL "net.archean.type"="Monitor"
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci

FROM base AS release
COPY . /app
CMD npm run dev
EXPOSE 3000