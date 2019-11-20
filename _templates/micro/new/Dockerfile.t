---
to: <%= name %>/Dockerfile
unless_exists: true
---
FROM node:current-alpine
LABEL "net.archean.type"="Micro"
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD npm start
EXPOSE 3000


