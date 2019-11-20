FROM cypress/included:3.6.1
LABEL "net.archean.type"="Testing"
COPY ./cypress /e2e/cypress
COPY ./rest /e2e/rest
COPY *.json /e2e/
COPY ./cypress-runner.js /e2e/
WORKDIR /e2e
RUN npm ci
ENTRYPOINT ["node","cypress-runner.js"]