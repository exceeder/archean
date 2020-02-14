
function lazyLoadThreeJs(done) {
    // lazily import Scene3d from "./scene3d/scene3d.js"
    //import("./scene3d.js")
    import("./stage.js")
        .then((module) => {
            done(module.default);
        });
}

//starting from this level, everything is agnostic to app business logic

export default {
    template: `
    <div>
        <div class="canvas3d" ref="canvas3d"></div>
        <slot></slot>
        <div class="annotation" ref="annotation" @click="hideAnnotation">
          <slot name="annotation">Loading...</slot>
        </div>  
    </div>
    `,
    props:{
        paused: Boolean,

        camera: {
            type: Object,
            default: () => ({ pos:[0,10,0], target:[0,0,1.5], fov:45, near:2, far:32 })
        },
        clearColor: {
            type: Object,
            default: () => ({ rgb: 0xa0a0a0, alpha: 0.5 })
        },
        lightsColor: {
            type: Number,
            default: () =>  0xa0a0a0
        }
    },
    data() {
      return {
          status: {
              loaded: false
          }
      }
    },
    stage: {
        scene: null,
        stage3d: null
    },
    provide () {
        return {
            stage: {
                ref: this.$options.stage,
                status: this.status
            },

        }
    },
    mounted() {
        lazyLoadThreeJs(Stage => {
            this.lazyInit(new Stage(this.$refs.canvas3d, this.$refs.annotation))
        });
    },
    methods: {
        lazyInit(stage) {
            this.$options.stage.scene = stage.scene; //Three.Scene
            this.$options.stage.stage3d = stage; //./Stage
            this.status.loaded = true;
            console.log("Scene loaded");
            stage.mount(stage.scene);
            stage.start();

        },
        hideAnnotation() {
            //feels like a kludge... but ok for now
            document.querySelector('.annotation').classList.remove('visible');
        }
    }
}
