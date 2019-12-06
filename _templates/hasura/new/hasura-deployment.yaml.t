---
to: backend-hasura/k8s/deployment.yaml
unless_exists: true
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-hasura
  labels:
    app: hasura
    repo: archean-micros
spec:
  selector:
    matchLabels:
      app: hasura
      role: master
      tier: backend
  replicas: 1
  template:
    metadata:
      labels:
        app: hasura
        role: master
        tier: backend
        repo: archean-micros
    spec:
      containers:
        - name: master
          image: hasura/graphql-engine:v1.0.0-rc.1
          env:
            - name: HASURA_GRAPHQL_DATABASE_URL
              value: 'postgres://postgres:@backend-postgres:5432/postgres'
            - name: HASURA_GRAPHQL_ENABLE_CONSOLE
              value: 'true'
            - name: HASURA_GRAPHQL_ENABLED_LOG_TYPES
              value: 'startup, http-log, webhook-log, websocket-log, query-log'
            - name: HASURA_GRAPHQL_ADMIN_SECRET
              value: 'archean'
          resources:
            requests:
              cpu: 100m
              memory: 500Mi
          ports:
            - containerPort: 8080