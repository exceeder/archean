const redis = require('redis')
const Target = require('./models/target')

/**
 * Registry of all microservices, contains an array of targets and listens to Redis heartbeat channel
 * @type {Registry}
 */
class Registry {

    constructor(props) {
        this.targets = []
        this.heartbeat = this.subscribeToHeartBeat(props, message => this.onHeartbeat(message))
        this.evictInterval = setInterval(() => this.evictStaleTargets(), 5000)
    }

    match(uri) {
        return this.targets.find(t => uri.startsWith(t.prefix))
    }

    subscribeToHeartBeat(props, onHeartbeat) {
        const subscriber = redis.createClient(props)
        subscriber.on('error', (err) => {
            console.log(err.message);
        }).on('ready', () => {
            subscriber.on("message", (_, message) => onHeartbeat(message))
            subscriber.subscribe(props.channel);
        });
        return subscriber
    }

    onHeartbeat(message) {
        const [baseUrl, prefix] = message.split("\n");
        const target = this.targets.find(t => t.prefix === prefix)
        if (target) {
            //requests will distribute based on who is pinging
            target.ping(baseUrl)
        } else {
            this.registerTarget(baseUrl, prefix)
        }
    }

    registerTarget(baseUrl, prefix) {
        const target = new Target(baseUrl, prefix);
        this.targets.push(target)
        //sort with longest prefix first
        this.targets.sort((a,b) => a.prefix.length - b.prefix.length)
        console.log("New app registered: ", target)
    }

    evictStaleTargets() {
        //find stale pods
        this.targets.forEach( t => t.evictStalePods())
        const staleTargets = this.targets.filter(t => Object.keys(t.pods).length === 0)
        //remove stale pods
        staleTargets.forEach(t => this.targets.splice(this.targets.findIndex(el => el === t),1));
    }

    close() {
        this.heartbeat.close()
        clearInterval(this.evictInterval);
    }
}

module.exports = Registry