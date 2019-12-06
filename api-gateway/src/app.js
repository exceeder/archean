const express = require('express');
const Registry = require('./registry')
const Proxy = require('./proxy')

const port = 3000
const app = express()

const registry = new Registry({host: "backend-redis", port: 6379, channel: "heartbeat"})
const proxy = new Proxy({gatewayURL: "http://localhost:30000"});
const defaultRedirect = (req, res) => res.redirect("/archean")
const gatewayTargetsApi = (req, res) => res.contentType("application/json").send(JSON.stringify(registry.targets));

app.use("/", async (req, res) => {
    if (req.originalUrl === "/v1/api-gateway/targets") {
        gatewayTargetsApi(req,res);
        return;
    }
    let target = registry.match(req.originalUrl)
    if (target) {
        try {
            let responseCode = await proxy.proxy(req, res, target)
            if (responseCode > 500) {
                console.log("Downstream response error" + responseCode, " from ", target)
            }
        } catch (e) {
            console.log("Proxy error", e.message)
        }
    } else if (req.originalUrl === "/") {
        defaultRedirect(req,res);
    } else {
        res.status(404).send("Gateway did not match " + req.originalUrl + " to any of the targets: "+JSON.stringify(registry.targets))
    }
})

const server = app.listen(port, '0.0.0.0', () => console.log(`API Gateway listening on port ${port}!`))
server.on('close', () => registry.close());