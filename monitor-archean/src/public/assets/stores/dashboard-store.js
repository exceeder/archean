const fetchApps = () => fetch("/v1/api-gateway/targets").then(res => res.json())
const fetchPods = () => fetch("/archean/v1/pods").then(res => res.json())
const fetchDeployments = () => fetch("/archean/v1/deployments").then(res => res.json())
const fetchRedisStats = () => fetch("/archean/v1/redis-stats").then(res => res.json())

const store = new Vuex.Store({
    state: {
        apps: [],
        pods: [],
        deployments: [],
        stats: []
    },
    mutations: {
        apps(state, payload) {
            state.apps = payload
        },
        pods(state, payload) {
            state.pods = payload
        },
        deployments(state, payload) {
            state.deployments = payload
        },
        stats(state, payload) {
            state.stats = payload
        },
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
                .catch(e => console.log(e));
        },
        updateDeployments(context) {
            fetchDeployments()
                .then(res => context.commit('deployments', res.body.items))
                .catch(e => console.log(e));
        },
        updateStats(context) {
            fetchRedisStats()
                .then(res => context.commit('stats', res))
                .catch(e => console.log(e));
        }
    }
})

export default store;