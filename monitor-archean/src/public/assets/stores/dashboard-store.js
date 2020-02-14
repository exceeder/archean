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
        events: [],
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
        addEvent(state, payload) {
            state.events.push(payload)
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
    },
    getters: {
        focusedDeployments: state => {
            return state.filtering.focused ?
                state.deployments.filter(d => d.metadata.labels && d.metadata.labels['app-type']) :
                state.deployments
        },
        focusedPods: (state, getters) => {
            const names = getters.focusedDeployments.map(d => d.metadata.name)
            return state.filtering.focused ?
                state.pods.filter(pod => names.indexOf(pod.metadata.labels.app) >= 0) :
                state.pods
        },
        focusedApps: (state, getters) => {
            const ipWhitelist = getters.focusedPods.map(pod => pod.status.podIP)
            return state.filtering.focused ?
                state.apps.filter(app => ipWhitelist.filter(ip => Object.keys(app.pods)[0].indexOf(ip) > 0).length > 0) :
                state.apps
        },
        getPodsByDeploymentName: (state) => (name) => {
            return state.pods.filter(pod => pod.metadata.labels && pod.metadata.labels.app === name)
        },
        recentEvents: (state, getters) => {
            const ipWhitelist = getters.focusedPods.map(pod => pod.status.podIP)
            if  (state.filtering.focused) {
                return state.events.filter(e => ipWhitelist.indexOf(e.data.status.podIP)>=0 ||
                    (e.data.metadata.labels && e.data.metadata.labels['app-type'])).slice(-16).reverse()
            } else {
                return state.events.slice(-16).reverse()
            }
        }
    }
})

export default store;