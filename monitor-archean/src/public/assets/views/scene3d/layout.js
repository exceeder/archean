export const Layout = {
    name: "Layout",
    inject: ["state3d", "ready"],
    provide() {
        return {
            state3d: this.state3d,
            numRows: this.numRows
        };
    },
    rendered: false,
    render(h) {
        console.log("render Layout ", this.ready.loaded);
        //"touching" `ready` prop to cause rendering when stage is ready
        if (this.ready.loaded && !this.$options.rendered) {
            this.$options.rendered = true;
        }
        //Layout needs some DOM content to track live changes
        return h(
            "div",
            { style: { display: "none" } },
            this.ready.loaded ? this.$slots.default : []
        );
    },
    methods: {
        numRows() {
            let arr = this.$slots.default;
            if (!arr) return 0;
            return arr.filter(slot => slot.tag).length;
        }
    }
};

export const Row = {
    name: "Row",
    inject: ["state3d", "numRows"],
    provide() {
        return {
            state3d: this.state3d,
            numRows: this.numRows,
            numBoxes: this.numBoxes,
            rowIdx: this.rowIdx
        };
    },
    idx: -1,
    boxIndex: 0,
    created() {
        this.$options.idx = this.$parent.$children.findIndex(c => c === this);
    },
    render(h) {
        console.log("render Row ", this.rowIdx());
        this.state3d.stage.adjustRow(this.rowIdx(), this.numBoxes());
        return h("div", this.$slots.default);
    },
    methods: {
        numBoxes() {
            let arr = this.$slots.default;
            if (!arr) return 0;
            return arr.filter(slot => slot.tag).length;
        },
        rowIdx() {
            return this.$options.idx;
        }
    }
};

const LayoutElement = {
    props: ["name", "size"],
    inject: ["state3d", "rowIdx", "numRows", "numBoxes"],
    idx: -1,
    created() {
        this.$options.idx = this.$parent.$children.findIndex(c => c === this);
    }
};

export const Box = {
    name: "Box",
    extends: LayoutElement,
    render(h) {
        const numBoxes = this.numBoxes();
        console.log("render box ", this.name, numBoxes);
        if (numBoxes !== 0) {
            this.state3d.stage.renderBox(
                this.$options.idx,
                this.rowIdx(),
                numBoxes,
                this.numRows(),
                this.name,
                this.size
            );
        }
        return null;
    }
};

export const Cylinder = {
    name: "Cylinder",
    extends: LayoutElement,
    render(h) {
        const numBoxes = this.numBoxes();
        console.log("render cyl ", this.name, numBoxes);
        if (numBoxes !== 0) {
            this.state3d.stage.renderCylinder(
                this.$options.idx,
                this.rowIdx(),
                numBoxes,
                this.numRows(),
                this.name,
                this.size
            );
        }
        return null;
    }
};


