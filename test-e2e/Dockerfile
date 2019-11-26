FROM cypress/included:3.6.1 AS base
LABEL "net.archean.type"="Testing"
WORKDIR /e2e
COPY *.json /e2e/
RUN npm ci

FROM base AS release
COPY ./cypress /e2e/cypress
COPY ./rest /e2e/rest
COPY ./cypress-runner.js /e2e/
ENTRYPOINT ["node","cypress-runner.js"]