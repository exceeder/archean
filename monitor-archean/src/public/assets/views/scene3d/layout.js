export const Layout = {
    inject: ['stage'],
    provide () {
        return {
            scene: this.stage.scene
        }
    },
    rendered: false,
    render(h) {
        const loaded = this.stage.status.loaded;
        console.log("render() layout ", loaded)
        if (!this.$options.rendered && loaded) {
            this.stage.ref.stage3d.createCubes(this.stage.ref.scene);
            //this.stage.ref.stage3d.createBox(0, 0, 3,3, "test", this.stage.ref.scene);
            this.$options.rendered = true;
        }
        return h('div', {style: {display: 'none'}}, loaded ? this.$slots.default : [])
    },
    mounted() {
        console.log("layout mounted")
        if (this.stage.status.loaded) {
            this.stage.ref.stage3d.createCubes(this.stage.ref.scene);
        }
    }
}

export const Row = {
    inject: ['stage'],
    provide () {
        return {
            scene: this.stage.ref.scene
        }
    },
    render(h) {
        console.log("render() row ", this.stage.ref.scene)
        return h('div',this.$slots.default);
    },
    mounted() {
        console.log("row  mounted")
    }
}

export const Box = {
    props: ["name","data","size"],
    inject: ['stage'],
    render(h) {
        console.log("render() box "+this.name, this.stage.scene)
        return null;
    },
    mounted() {
        console.log("box "+this.name+" mounted", this.stage.scene)
    }
}


