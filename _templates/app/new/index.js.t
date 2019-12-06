---
to: <%= name %>/src/index.js
unless_exists: true
---
const express = require('express');
const redis = require('redis');

const port = 3000
const app = express()

//process get requests
app.get("/<%= name %>", async (req, res) => {
    res.contentType("application/json").send(JSON.stringify({result: new Date(), greeting:"Hello from <%= Name %>!"}))
});

//running heartbeat; message format is <your own url><CR><prefix>, e.g. "http://192.168.0.1:3000\n/<%= name %>"
const publisher = redis.createClient({host:"backend-redis", port:6379})
publisher
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/<%= name %>`), 2000)
    );


//start listening for http requests
app.listen(port, '0.0.0.0', () => console.log(`Query at ${process.env.MY_POD_IP} listening on port ${port}!`))
