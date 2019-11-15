const express = require('express');
const redis = require('redis');

const port = 3000
const app = express()

//process get requests
app.get("/query", async (req, res) => {
    console.log("query!")
    res.contentType("application/json").send(JSON.stringify({query: new Date()}))
});

//running heartbeat; message format is <your own url><CR><prefix>, e.g. "http://192.168.0.1:3000\n/some/path"
const publisher = redis.createClient({host:"redis-master", port:6379})
publisher
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/query`), 2000)
    );


//start listening for http requests
app.listen(port, '0.0.0.0', () => console.log(`Query at ${process.env.MY_POD_IP} listening on port ${port}!`))
