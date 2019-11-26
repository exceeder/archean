const express = require('express')
const redis = require('redis');
const {findInDir, stripAnsiCodes} = require('./utils/utils')
const initSSE = require('./utils/sse-utils')
const createRedisClient = require('./utils/redis-utils')

const port = 3000
const app = express()

//return all stored logs as array from Redis
app.get("/tests/e2e/logs", async (req, res) => {
    const redis = await createRedisClient();
    const arr = await redis.lrange("tests-e2e", 0, -1);
    const htmlArr = arr.map(l => stripAnsiCodes(l))
    res.contentType("application/json").send(JSON.stringify(arr))
    redis.client.quit();
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
    const redis = await createRedisClient();
    const arr = await redis.lrange("tests-e2e", 0, -1);
    const htmlArr = arr.map(l => stripAnsiCodes(l))
    res.contentType("text/html").send(htmlArr.join(""))
    redis.client.quit();
});

//read unprocessed events from Redis that happened after lastId
async function fetchEventsSince(lastId) {
    const redis = await createRedisClient();
    let counter = Number.parseInt(await redis.get("tests-e2e-counter") || 0);
    //if the last message was before counter, then we missed some logs, return all we have, otherwise return diff
    const from = lastId < counter ? 0 : lastId - counter;
    //console.log("Replay counter:" + counter + " lastId:" + lastId + " from:" + from);
    const arr = await redis.lrange("tests-e2e", from, -1);
    redis.client.quit();
    return arr.map( (l,idx) => ({ id: counter+idx, message:stripAnsiCodes(l) }) )
}

//subscribe to log events SSE stream
app.get('/tests/e2e/html/stream', (req, res) => {
    const stream = initSSE(req, res, fetchEventsSince)
    const subscription = resultsPublisher.subscribe({
        onData: (item) => stream.send({id:item.id, message: stripAnsiCodes(item.message)} ),
        onClose: () => stream.close()
    })
    stream.onClose = () => resultsPublisher.remove(subscription)
});

//start listening for http requests
app.listen(port, '0.0.0.0', () => console.log(`E2E Tests at ${process.env.MY_POD_IP} listening on port ${port}!`))

//register this API with gateway at /tests/e2e perfix
const publisher = redis.createClient({host:"backend-redis", port:6379})
publisher
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/tests/e2e`), 2000)
    );

//export communication sync to use with Cypress
const resultsPublisher = {
    subscribers: [],

    notify(item) { this.subscribers.forEach(s => s.onData(item)); },
    subscribe(subscriber) { this.subscribers.push(subscriber); return subscriber; },
    remove(subscriber) { this.subscribers.splice( this.subscribers.indexOf(subscriber), 1 ) },
    close() { this.subscribers.forEach(s => s.onClose())}
}
module.exports = resultsPublisher;