const express = require('express')
const redis = require('redis')
const {findInDir, ansiStrip} = require('./utils')

const MAX_LOG_SIZE = 100
const port = 3000
const app = express()

const resultsPublisher = {
    subscribers: [],

    notify() { this.subscribers.forEach(onDataAvailable => onDataAvailable()); },
    subscribe(subscriber) { this.subscribers.push(subscriber); },
    remove(subscriber) { this.subscribers.splice( this.subscribers.indexOf(subscriber), 1 )}
}

//register API with gateway
const redisClient = redis.createClient({host:"backend-redis", port:6379})
redisClient
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            redisClient.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/tests/e2e`), 2000)
    );

//return test logs as original array from Redis
app.get("/tests/e2e", async (req, res) => {
    //res.contentType("application/json").send(JSON.stringify(tests))
    const client = redis.createClient({host:"backend-redis", port:6379});
    client.on("connect", () => {
        client.lrange("tests-e2e", 0, -1, (err, arr) => {
            res.contentType("application/json").send(JSON.stringify(arr))
        });
    }).on('error', (err) => res.send(err.message))
});

//return test results file list
app.get("/tests/e2e/files", async (req, res) => {
    const files = findInDir("/e2e/cypress");
    res.contentType("application/json")
        .send(JSON.stringify(files.map(f => f.substr("/e2e/cypress/".length))))
});

//return particular file
app.get("/tests/e2e/files/*", async (req, res) => {
    const file = `/e2e/cypress/${req.params[0]}`;
    res.download(file);
});

//return logs as text
app.get("/tests/e2e/html", async (req, res) => {
    const client = redis.createClient({host:"backend-redis", port:6379});
    client.on("connect", () => {
        client.lrange("tests-e2e", 0, -1, (err, arr) => {
            const htmlArr = arr.map(l => l.replace(ansiStrip(),''))
            res.contentType("text/html").send(htmlArr.join(""))
        });
    }).on('error', (err) => res.send(err.message))
});

function initializeSSE(req, res) {
    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write('\n');

    let lastId = req.headers["last-event-id"];
    let messageId = lastId || 0;
    console.log('LastID:' + lastId);
    replaySSE(messageId, res);

    const onData = () => {
        redisClient.lrange("tests-e2e", messageId, -1, (err, arr) => {
            if (arr && arr.length > 0) {
                messageId += arr.length;
                console.log("Counter:"+messageId);
                const htmlArr = arr.map(l => l.replace(ansiStrip(),''))
                const log = htmlArr.join("");
                console.log("Sending:"+log);
                res.write(`id: ${messageId}\n`);
                res.write(`data: ${JSON.stringify(log)}\n\n`);
            }
        });

    }
    resultsPublisher.subscribe(onData);

    const intervalId = setInterval(() => {
        res.write(`id: ${messageId}\n`);
        res.write(`data: PING\n\n`);
    }, 2000);

    req.on('close', () => {
        console.log("closed "+intervalId);
        clearInterval(intervalId);
        resultsPublisher.remove(onData);
    });
}

function replaySSE(lastId, res) {
    console.log("replay from "+lastId)
    redisClient.get("tests-e2e-counter", (err, val) => {
        console.log("Counter:"+val); //counter is at last
        if (!val) val = 0;
        const from = lastId - val;
        redisClient.lrange("tests-e2e", from, -1, (err, arr) => {
            lastId += arr.length;
            const htmlArr = arr.map(l => l.replace(ansiStrip(),''))
            const log = htmlArr.join("");
            res.write(`id: ${lastId}\n`);
            res.write(`data: ${JSON.stringify(log)}\n\n`);
        });
    })
}

//subscribe to log events SSE stream
app.get('/tests/e2e/html/stream', (req, res) => {
    initializeSSE(req, res);
});

//start listening for http requests
app.listen(port, '0.0.0.0', () => console.log(`E2E Tests at ${process.env.MY_POD_IP} listening on port ${port}!`))

module.exports = resultsPublisher;