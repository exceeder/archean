FROM cypress/included:3.4.0
LABEL "net.archean.type"="Testing"
COPY ./cypress /e2e/cypress
COPY cypress.json /e2e/cypress.json
WORKDIR /e2e
CMD cypress run "--no-exit" "--env" "TEST_ENV=dev"