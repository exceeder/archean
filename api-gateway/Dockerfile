FROM node:current-alpine
LABEL "net.archean.type"="API-Gateway"
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci
COPY . /app
CMD npm start
EXPOSE 3000