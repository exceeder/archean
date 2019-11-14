const express = require('express');
const createRegistry = require('./registry')
const Proxy = require('./proxy')

const port = 3000
const app = express()

const registry = createRegistry({host: "redis-master", port: 6379, channel: "heartbeat"})

const proxy = new Proxy({gatewayURL: "http://localhost:30000"});

const defaultRedirect = (req, res) => res.redirect("/archean")
const defaultApi = (req, res) => res.contentType("application/json").send(JSON.stringify(registry.targets));

app.use("/", async (req, res) => {
    let target = registry.match(req.originalUrl)
    if (target) {
        try {
            let responseCode = await proxy.proxy(req, res, target)
        } catch (e) {
            console.log("Proxy error",e)
        }
    } else if (req.originalUrl === "/") {
        defaultRedirect(req,res);
    } else if (req.originalUrl === "/v1/api-gateway/targets") {
        defaultApi(req,res);
    } else {
        res.status(404).send("Gateway did not match " + req.originalUrl + " to any of: "+JSON.stringify(registry.targets))
    }
})


const server = app.listen(port, '0.0.0.0', () => console.log(`API Gateway listening on port ${port}!`))
server.on('close', () => registry.close());