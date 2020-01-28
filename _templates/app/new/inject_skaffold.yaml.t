---
inject: true
to: skaffold.yaml
after: "  artifacts:"
skip_if: <%= name %>
---
    - image: <%= name %>
      context: ./<%= name %>/