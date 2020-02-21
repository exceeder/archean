FROM node:current-alpine AS base
LABEL "net.archean.type"="Micro"
WORKDIR /app
RUN yarn global add @vue/cli -g
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=100
COPY package.json /app
COPY package-lock.json /app
RUN npm install

FROM base AS dev
COPY . /app
RUN npm run build
CMD yarn express:run & yarn serve in kustomize to hotserve
EXPOSE 8080

FROM node:current-alpine AS prodBase
LABEL "net.archean.type"="Micro"
WORKDIR /app
COPY ./backend/package.json /app/
RUN npm install
EXPOSE 3000

FROM prodBase AS prod
LABEL "net.archean.type"="Micro"
WORKDIR /app
COPY --from=dev /app/dist /app/dist/
COPY ./backend /app/backend/
CMD npm start




