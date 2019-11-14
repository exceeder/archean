FROM node:current-alpine
LABEL "net.archean.type"="Monitor"
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci
COPY . /app
CMD npm run dev
EXPOSE 3000