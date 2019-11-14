const redis = require('redis')

const targets = []

/**
 * Class that contains information about proxy target, usually a microservice running on specific IP and port
 * @type {Target}
 */
class Target {
    constructor(baseUrl, prefix) {
        this.baseUrl = baseUrl
        this.prefix = prefix
        this.lastPing = new Date().getTime()
        this.requestCount = 0;
        console.log("New app registered: ", this)
    }

    translate(uri) {
        this.requestCount++;
        return this.baseUrl + uri
    }
}
exports.Target = Target

const onHeartbeat = (message) => {
    const [baseUrl, prefix] = message.split("\n");
    const target = targets.find(t => t.prefix === prefix)
    if (target) {
        target.baseUrl = baseUrl
        target.lastPing = new Date().getTime()
    } else {
        targets.push(new Target(baseUrl, prefix))
        targets.sort((a,b) => a.prefix.length - b.prefix.length)
    }
}

const subscribe = function subscribeToHeartBeat(props, onHeartbeat) {
    const subscriber = redis.createClient(props)
    subscriber.on("message", (_, message) => onHeartbeat(message))
    subscriber.subscribe(props.channel);
    return subscriber
}

const evictStaleTargets = () => {
    const currentTime = new Date().getTime()
    const staleTargets = targets.filter( t => currentTime - t.lastPing > 5000);
    staleTargets.forEach(t => targets.splice(targets.findIndex(e => e === t),1));
}

function createRegistry(props) {
    const interval = setInterval(evictStaleTargets, 5000)
    return {
        targets: targets,
        heartbeat: subscribe(props, onHeartbeat),
        match(uri) {
            return this.targets.find(t => uri.startsWith(t.prefix))
        },
        close() {
            this.heartbeat.close()
            clearInterval(interval);
        }
    }
}

exports = module.exports = createRegistry