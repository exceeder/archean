---
inject: true
to: kustomization.yaml
after: "resources:"
skip_if: <%= name %>
---
  - <%= name %>/k8s/deployment.yaml