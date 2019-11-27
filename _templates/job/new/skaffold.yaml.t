---
inject: true
to: skaffold.yaml
after: "  artifacts:"
---
    - image: <%= name %>
      context: ./<%= name %>/