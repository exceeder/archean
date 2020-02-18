---
to: backend-postgres/k8s/deployment.yaml
unless_exists: true
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-postgres
  labels:
    app: postgres
    repo: archean-micros
spec:
  selector:
    matchLabels:
      app: postgres
      role: master
      tier: backend
  replicas: 1
  template:
    metadata:
      labels:
        app: postgres
        role: master
        tier: backend
        repo: archean-micros
    spec:
      containers:
        - name: master
          image: postgres
          env:
            - name: POSTGRES_HOST_AUTH_METHOD
              value: "trust"
          resources:
            requests:
              cpu: 100m
              memory: 50Mi
          ports:
            - containerPort: 5432