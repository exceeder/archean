---
inject: true
to: kustomization.yaml
after: "resources:"
---
  - backend-postgres/k8s/deployment.yaml
  - backend-postgres/k8s/service.yaml
  - backend-hasura/k8s/deployment.yaml
  - backend-hasura/k8s/service.yaml