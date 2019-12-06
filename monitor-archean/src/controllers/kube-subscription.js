const MonitorEvent = require('../models/monitor-event')

const kubeNamespace = 'default';

class KubeSubscription {

    constructor(client){
        this.client = client;
    }

    async subscribe(req, res) {
        let intervalId = setInterval(() => {
            res.write(`event: PING\n`);
            res.write(`data: \n\n`);
        }, 5000);
        let deployEvents = null;
        let podEvents = null;
        const close = () => {
            clearInterval(intervalId)
            deployEvents && deployEvents.destroy() // note: xxxEvents are of class stream.Transform
            podEvents && podEvents.destroy()
        };
        req.on('close', close);
        req.on('timeout', () => { close(); res.close(); } );

        try {
            deployEvents = await this.client.apis.apps.v1.watch.deployments.getObjectStream()
            deployEvents.on('data', obj => this.forwardDeployEvent(obj, res))
            deployEvents.on('error', err => console.log("Deploy stream error",err))

            podEvents = await this.client.api.v1.watch.pods.getObjectStream()
            podEvents.on('data', obj => this.forwardPodEvent(obj, res))
            podEvents.on('error', err => console.log("Pod stream error",err))
        } catch (e) {
            console.log("Error: ",e);
        }
    }

    forwardDeployEvent(obj, res) {
        //see https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#deployment-status
        try {
            if (obj.object.metadata.namespace !== kubeNamespace) return;
            if (!obj.object.metadata.labels || obj.object.metadata.labels.repo !== 'archean-micros') return;
            //
            // console.debug("DEPLOYMENT", obj.type,
            //     obj.object.metadata.name,
            //     obj.object.metadata.creationTimestamp)

            let event = new MonitorEvent(obj.type, '',
                obj.object.metadata.name,
                obj.object.status.conditions ? obj.object.status.conditions[0].lastUpdateTime
                    : obj.object.metadata.creationTimestamp,
                {
                    metadata: obj.object.metadata,
                    spec: obj.object.spec,
                    status: obj.object.status
                })
            res.write(`event: DEPLOYMENTS\n`)
            res.write(`data: ${event.asJson()}\n\n`)
        } catch (e) {
            console.log("D forwarding error:", e);
        }
    }

    forwardPodEvent(obj, res) {
        try {
            //see https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
            if (obj.object.metadata.namespace !== kubeNamespace) return;
            if (!obj.object.metadata.labels || obj.object.metadata.labels.repo !== 'archean-micros') return;
 
            // console.debug("POD", obj.type,
            //     "name:", obj.object.metadata.name,
            //     "app:", obj.object.metadata.labels.app,
            //     "status:", obj.object.status,
            //     "ts:", obj.object.metadata.creationTimestamp);

            let event = new MonitorEvent(obj.type, obj.object.metadata.labels.app,
                obj.object.metadata.name,
                obj.object.status.conditions ? obj.object.status.conditions[0].lastTransitionTime
                    : obj.object.metadata.creationTimestamp,
                {
                    metadata: obj.object.metadata,
                    status: obj.object.status
                })
            res.write(`event: PODS\n`)
            res.write(`data: ${event.asJson()}\n\n`)
        } catch (e) {
            console.log("P forwarding error:", e);
        }
    }

}

module.exports = KubeSubscription