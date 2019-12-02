const fetch = require("node-fetch");
const URL = require('url').URL;
const http = require('http');

/**
 * Class that can proxy requests coming into express app to another http server
 * @type {Proxy}
 * @field gatewayURL {string} url of the api-gateway including protocol and host
 */
class Proxy {

    /**
     * Proxy constructor
     * @param {Object} props - configuration
     * @param {string} props.gatewayURL - full url of this gateway
     * @example
     *
     *      new Proxy({gatewayURL: "http://localhost:30000"})
     */
    constructor(props) {
        this.gatewayURL = new URL(props.gatewayURL);
    }

    /**
     * Proxy a request to a new, rewritten URL and respond with the result.
     * @param req {http.ClientRequest}  - HTTP request object
     * @param res {http.ServerResponse}  - HTTP response object
     * @param target {registry.Target} - forwarding target from registry
     * @returns {Promise<number>} - promise that resolves with the HTTP status after the response is proxied
     */
     async proxy(req, res, target) {
        const rewrittenUrl = target.translate(req.originalUrl);
        try {
            const clientRes = await fetch(rewrittenUrl, {
                method: req.method,
                headers: { 'x-forwarded-for': req.socket.remoteAddress, ...req.headers},
                redirect: 'manual',
                body: req.body
            });
            //transfer headers from the target response to our response
            this.copyHeaders(clientRes, res);
            //transfer HTTP status
            res.status(clientRes.status);
            //handle closing; for keep-alive/server-sent events, avoid connection leaks
            req.on('close', () => {
                clientRes.body.unpipe()
                res.end()
            })
            //pipe response body
            clientRes.body.pipe(res)
            return clientRes.status;
        } catch (error) {
            res.status(500).send(error.message).end()
        }
    }

    /**
     * Copy headers from HTTP client response to HTTP server response
     * Adjust HTTP redirects location to hit this gateway
     * @param clientRes - client response (coming from downstream)
     * @param serverRes - server response (will be sent upstream)
     */
    copyHeaders(clientRes, serverRes) {
        Object.entries(clientRes.headers.raw()).forEach(([key, value]) => {
            if (key.toLowerCase() === "location") {
                //handle location redirects to hide microservice
                let newLocation = new URL(value[0]);
                newLocation.hostname = this.gatewayURL.hostname
                newLocation.port = this.gatewayURL.port
                console.log("replacing "+value[0]+" with "+newLocation.href)
                value[0] = newLocation.href;
            }
            //console.log(key + "->" + value)
            serverRes.setHeader(key, value[0])
        });
    }

}

exports = module.exports = Proxy