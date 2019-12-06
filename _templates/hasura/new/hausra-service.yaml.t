---
to: backend-hasura/k8s/service.js
unless_exists: true
---
apiVersion: v1
kind: Service
metadata:
  name: backend-hasura
  labels:
    app: hasura
    role: master
    tier: backend
spec:
  type: NodePort
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080
  selector:
    app: hasura
    role: master
    tier: backend