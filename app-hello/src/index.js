const express = require('express');
const redis = require('redis');

const port = 3000
const app = express()

//process get requests
app.get("/hello", async (req, res) => {
    console.log(new Date() + ": an incoming /hello request!")
    res.contentType("application/json").send(JSON.stringify({hello: new Date(), test:"abc"}))
});

//running heartbeat; message format is <your own url><CR><prefix>, e.g. "http://192.168.0.1:3000\n/some/path"
const publisher = redis.createClient({host:"backend-redis", port:6379})
publisher
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/hello`), 2000)
    );

//start listening for http requests
const server = app.listen(port, '0.0.0.0', () => console.log(`Hello micro at ${process.env.MY_POD_IP} listening on port ${port}!`))

//graceful shutdown
process.on('SIGTERM',  () => server.close(() => process.exit()));