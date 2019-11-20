const express = require('express');
const redis = require('redis');
const path = require('path');
const Client = require('kubernetes-client').Client
const Request = require('kubernetes-client/backends/request')

const port = 3000
const app = express()

const kubeNamespace = 'default';

app.use('/archean', express.static(path.join(__dirname, 'public')))

const convertPlainTextPropertiesToObject = text => text.split("\n")
    .map(l => l.split(":"))
    .filter(s => s.length > 1)
    .reduce((acc, x) => { acc[x[0]] = x[1].trim(); return acc; }, {});

const sendError = (res, err) =>  res.status(500)
    .contentType("application/json")
    .send(JSON.stringify({error: err ? err.message : '?'}))

app.get("/archean/v1/redis-stats", async (req, res) => {
    const client = redis.createClient({host:"backend-redis", port:6379})
    client.info((err, reply) => {
        if (err || !reply) {
            return sendError(res, err);
        }
        const stats = convertPlainTextPropertiesToObject(reply)
        res.send(JSON.stringify({stats:stats}))
    });

})

const getKubeClent = async () => {
    const backend = new Request(Request.config.getInCluster())
    const client = new Client({ backend })
    await client.loadSpec()
    return client
}

app.get("/archean/v1/pods", async (req, res) => {
    try {
        const client = await getKubeClent()
        const pods = await client.api.v1.namespaces(kubeNamespace)
            .pods.get({ qs: { labelSelector: 'repo=archean-micros'}})
        res.contentType("application/json").send(JSON.stringify(pods))
    } catch (e) {
       sendError(res, e)
    }
})

let kubeEvents = [];

function sseData(req, res) {
    let messageId = 0;

    const intervalId = setInterval(() => {
        while (kubeEvents.length > 0) {
            res.write(`id: ${messageId}\n`);
            res.write(`data: ${kubeEvents[0]}\n\n`);
            messageId += 1;
            kubeEvents.splice(0,1);
        }
        res.write(`id: ${messageId}\n`);
        res.write(`data: PING\n\n`);
    }, 2000);

    req.on('close', () => {
        clearInterval(intervalId);
    });

    req.on('timeout', () => { res.close(); } );
}

let subscription = false;
async function subscribeToKubeEvents() {
    if (subscription) return;
    try {
        const client = await getKubeClent()
        const events = await client.apis.apps.v1.watch.namespaces('default').deployments.getObjectStream()
        //const jsonStream = new JSONStream()
        //stream.pipe(jsonStream)
        events.on('data', object => {
            //const status =  object.object.status.conditions ? object.object.status.conditions.map(c =>  JSON.stringify(c)).join(";") :
                JSON.stringify(object.object.status);
            //console.log(object.type,"name:",object.object.metadata.name,"ts:",object.object.metadata.creationTimestamp,"info:",status);
            kubeEvents.push(JSON.stringify({action:object.type, name:object.object.metadata.name}))
            //console.log('Event: ', JSON.stringify(object, null, 2))
        })
        events.on('error', err => {
            console.log("Stream error",err);
        })
        subscription = true;
    } catch (e) {
        console.log("Error: ",e);
    }
}


app.get('/archean/v1/events', async (req, res) => {
    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write('\n');

    sseData(req, res);
    await subscribeToKubeEvents();
});

app.get("/archean/v1/deployments", async (req, res) => {
    try {
        const client = await getKubeClent()
        const deployments = await client.apis.apps.v1.namespaces(kubeNamespace)
            .deployments().get({ qs: { labelSelector: 'repo=archean-micros'}})
        res.contentType("application/json").send(JSON.stringify(deployments))
    } catch (e) {
        sendError(res, e)
    }
})

app.get("/archean/v1/pods/:name/logs", async (req, res) => {
    try {
        const client = await getKubeClent()
        let logs = await client.api.v1.namespaces(kubeNamespace).pods(req.params.name).log.get()
        res.contentType("text/simple").send(logs.body)
    } catch (e) {
        sendError(res, e)
    }
})

//cluster announcer
const publisher = redis.createClient({host:"backend-redis", port:6379})
publisher
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/archean`), 2000)
    );

//http server
app.listen(port, '0.0.0.0', () => console.log(`Updater at IP ${process.env.MY_POD_IP} listening on port ${port}!`))
