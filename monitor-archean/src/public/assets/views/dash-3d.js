import store from "../stores/dashboard-store.js"
// import Scene3d from "./scene3d/scene3d.js"
function lazyLoadThreeJs(canvas3d, done) {
    import("./scene3d/scene3d.js")
        .then((module) => {
            const Scene3d = module.default;
            done(new Scene3d(canvas3d));
        });
}

export default {
    template: `
<section>
<div class="canvas3d" ref="canvas3d">
 
</div>
</section>
`,
    store,
    mounted() {
        this.refreshApps();
        lazyLoadThreeJs(this.$refs.canvas3d, (scene3d) => this.init(scene3d));
    },
    computed: {
        pods: () => store.state.pods
    },
    methods: {
        init(scene3d) { this.scene3d = scene3d; },
        refreshApps() { store.dispatch('updatePods') }
    },
    watch: {
        pods(state) {
            if (!this.scene3d) return;
            this.scene3d.model.nodes[1] = state
                .filter(pod => pod.metadata.labels.app.includes("micro"))
                .map(pod => pod.metadata.name)
        }
    }

}