---
to: <%= name %>/package.json
unless_exists: true
---
{
  "name": "<%= name %>",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "redis": "^2.8.0"
  }
}
