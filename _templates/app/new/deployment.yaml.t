---
to: <%= name %>/k8s/deployment.yaml
unless_exists: true
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <%= name %>
  labels:
    app: <%= name %>
    repo: archean-micros
    app-type: micro
spec:
  replicas: 1
  selector:
    matchLabels:
      app: <%= name %>
  template:
    metadata:
      labels:
        app: <%= name %>
        repo: archean-micros
    spec:
      containers:
        - name: <%= name %>
          image: "<%= name %>:latest"
          imagePullPolicy: IfNotPresent
          env:
          - name: MY_POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
          resources:
            requests:
              memory: "32Mi"
              cpu: "10m"