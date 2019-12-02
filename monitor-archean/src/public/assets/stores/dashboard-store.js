const fetchApps = () => fetch("/v1/api-gateway/targets").then(res => res.json())
const fetchPods = () => fetch("/archean/v1/pods").then(res => res.json())
const fetchDeployments = () => fetch("/archean/v1/deployments").then(res => res.json())
const fetchRedisStats = () => fetch("/archean/v1/redis-stats").then(res => res.json())

const store = new Vuex.Store({
    state: {
        apps: [],
        pods: [],
        deployments: [],
        stats: [],
        filtering: {
            focused: true
            //in the future, search terms etc. belong here
        }
    },
    mutations: {
        initialiseStore(state) {
            if(localStorage.getItem('dashboard-filtering')) {
                let filtering = JSON.parse(localStorage.getItem('dashboard-filtering'))
                this.replaceState( Object.assign(state, {filtering:filtering}) )
            }
        },
        apps(state, payload) {
            state.apps = payload
        },
        pods(state, payload) {
            state.pods = payload
        },
        deployments(state, payload) {
            state.deployments = payload
        },
        addPod(state, payload) {
            let idx = state.pods.map(d => d.metadata.name).indexOf(payload.metadata.name)
            if (idx !== -1) state.pods[idx] = payload; else state.pods.push(payload)
        },
        removePod(state, payload) {
            let idx = state.pods.map(d => d.metadata.name).indexOf(payload)
            if (idx !== -1) state.pods.splice(idx,1)
        },
        addDeployment(state, payload) {
            let idx = state.deployments.map(d => d.metadata.name).indexOf(payload.metadata.name)
            if (idx !== -1) state.deployments[idx] = payload; else state.deployments.push(payload)
        },
        removeDeployment(state, payload) {
            let idx = state.deployments.map(d => d.metadata.name).indexOf(payload)
            if (idx !== -1) state.deployments.splice(idx,1)
        },
        stats(state, payload) {
            state.stats = payload
        },
        filtering(state, payload) {
            state.filtering = payload
            localStorage.setItem('dashboard-filtering', JSON.stringify(payload))
        }
    },
    actions: {
        updateApps(context) {
            fetchApps()
                .then(res => context.commit('apps', res))
                .catch(e => console.log(e))
        },
        updatePods(context) {
            fetchPods()
                .then(res => context.commit('pods', res.body.items))
                .catch(e => console.log(e))
        },
        updateDeployments(context) {
            fetchDeployments()
                .then(res => context.commit('deployments', res.body.items))
                .catch(e => console.log(e))
        },
        removeDeployment(context, name) {
          context.commit('removeDeploymentByName', name)
        },
        updateStats(context) {
            fetchRedisStats()
                .then(res => context.commit('stats', res))
                .catch(e => console.log(e))
        },
        setFiltering(context, isFocused) {
            context.commit('filtering', { focused: isFocused })
        }
    }
})

export default store;