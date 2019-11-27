---
inject: true
to: kustomization.yaml
after: "resources:"
---
  - <%= name %>/k8s/job.yaml