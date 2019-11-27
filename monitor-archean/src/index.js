const express = require('express');
const redis = require('redis');
const path = require('path');
const Client = require('kubernetes-client').Client
const Request = require('kubernetes-client/backends/request')
const MonitorEvent = require('./models/monitor-event')
const port = 3000
const app = express()

const kubeNamespace = 'default';
let client = null;

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

app.get("/archean/v1/pods", async (req, res) => {
    try {
        const pods = await client.api.v1.namespaces(kubeNamespace).pods.get({
            qs: { labelSelector: 'repo=archean-micros'}
        })
        res.contentType("application/json").send(JSON.stringify(pods))
    } catch (e) {
       sendError(res, e)
    }
})


function forwardDeployEvent(obj, res) {
    try {
        if (obj.object.metadata.namespace !== 'default') return;
        console.debug("DEPLOYMENT", obj.type, obj.object.metadata.name, obj.object.metadata.creationTimestamp)
        let event = new MonitorEvent(obj.type, '',
            obj.object.metadata.name,
            obj.object.metadata.creationTimestamp, {
                metadata: obj.object.metadata,
                spec: obj.object.spec,
                status: obj.object.status
            })
        res.write(`event: DEPLOYMENTS\n`)
        res.write(`data: ${event.asJson()}\n\n`)
    } catch (e) {
        console.log(e);
    }
}

function forwardPodEvent(obj, res) {
    if (obj.object.metadata.namespace !== 'default') return;
    console.debug("POD", obj.type,
        "name:", obj.object.metadata.name,
        "app:", obj.object.metadata.labels.app,
        //"container:", obj.object.spec.containers[0].name,
        //"image:", obj.object.spec.containers[0].image,
        "status:", obj.object.status.phase,
        "ts:", obj.object.metadata.creationTimestamp);
    //console.debug(JSON.stringify(obj.object.status.containerStatuses,null,2))

    let event = new MonitorEvent(obj.type, obj.object.metadata.labels.app,
        obj.object.metadata.name,
        obj.object.metadata.creationTimestamp, {
            metadata: obj.object.metadata,
            status: obj.object.status
        })
    res.write(`event: PODS\n`)
    res.write(`data: ${event.asJson()}\n\n`)
}

async function subscribeToKubeEvents(req, res) {
    let intervalId = setInterval(() => {
        res.write(`event: PING\n`);
        res.write(`data: \n\n`);
    }, 5000);
    let deployEvents = null;
    let podEvents = null;
    const close = () => {
        clearInterval(intervalId)
        deployEvents && deployEvents.abort()
        podEvents && podEvents.abort()
    };
    req.on('close', close);
    req.on('timeout', () => { close(); res.close(); } );

    try {
        deployEvents = await client.apis.apps.v1.watch.deployments.getObjectStream()
        deployEvents.on('data', obj => forwardDeployEvent(obj, res))
        deployEvents.on('error', err => console.log("Deploy stream error",err))

        podEvents = await client.api.v1.watch.pods.getObjectStream()
        podEvents.on('data', obj => forwardPodEvent(obj, res))
        podEvents.on('error', err => console.log("Pod stream error",err))
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
    await subscribeToKubeEvents(req, res)
});

app.get("/archean/v1/deployments", async (req, res) => {
    try {
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

new Promise(async (resolve, reject) => {
    try {
        //connect to in-pod kubernetes client
        const backend = new Request(Request.config.getInCluster())
        const k8sClient = new Client({ backend })
        await k8sClient.loadSpec()
        resolve(k8sClient);
    } catch (e) { reject(e); }
}).then(k8sClient => {
    client = k8sClient;
    //http server
    app.listen(port, '0.0.0.0', () => console.log(`Updater at IP ${process.env.MY_POD_IP} listening on port ${port}!`))

    //cluster announcer
    const publisher = redis.createClient({host: "backend-redis", port: 6379})
    publisher
        .on('error', (err) => console.log(err.message))
        .on('ready', () =>
            setInterval(() =>
                publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${port}\n/archean`), 2000)
        );
}).catch(e => console.log(e));