import store from '../stores/dashboard-store.js';

const ping = {
    eventType: 'PING',
    handle() {
        store.dispatch('updateApps'); //update micros tab
    }
}

const pods = {
    eventType: 'PODS',
    handle: function (event) {
        const monitorEvent = JSON.parse(event.data)
        switch (monitorEvent.action) {
            case "MODIFIED":
            case "ADDED":
                store.commit('addPod', monitorEvent.data)
                break;
            case "DELETED":
                store.commit('removePod', monitorEvent.name)
                break;
        }

    }
}

const deployments = {
    eventType: 'DEPLOYMENTS',
    handle: function (event) {
        const monitorEvent = JSON.parse(event.data)
        switch (monitorEvent.action) {
            case "MODIFIED":
            case "ADDED":
                store.commit('addDeployment', monitorEvent.data)
                break;
            case "DELETED":
                store.commit('removeDeployment', monitorEvent.name)
                break;
        }
    }
}

const traffic = {
    eventType: 'TRAFFIC',
    handle: function (event) {
        const monitorEvent = JSON.parse(event.data)
        //store.commit('nodes/updateNodeStatus', parsed)
    }
}

const Handlers = [
    ping,
    pods,
    deployments,
    traffic
]

export default Handlers