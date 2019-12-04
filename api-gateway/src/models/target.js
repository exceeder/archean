const Pod = require('./pod')
/**
 * Class that contains information about proxy target, usually a microservice running on specific IP and port
 * @type {Target}
 */
class Target {
    constructor(baseUrl, prefix) {
        this.prefix = prefix
        this.requestCount = 0;
        this.pods = {
            [baseUrl]: new Pod(baseUrl)
        }
        this.ping(baseUrl)
    }

    translate(uri) {
        const urls = Object.keys(this.pods)
        //round-robin load balancing
        const base = urls[this.requestCount % urls.length]
        this.requestCount++
        return base + uri
    }

    ping(baseUrl) {
        const pod = this.pods[baseUrl];
        if (pod) {
            pod.ping()
        } else {
            this.pods[baseUrl] = new Pod(baseUrl)
        }
    }

    evictStalePods() {
        const stale = Object.values(this.pods).filter(p => Date.now() - p.lastPing > 3000)
        stale.forEach(p => delete this.pods[p.baseUrl]);
    }
}

module.exports = Target