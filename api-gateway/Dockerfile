FROM node:current-alpine AS base
LABEL "net.archean.type"="API-Gateway"
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci

FROM base AS release
COPY . /app
CMD npm start
EXPOSE 3000