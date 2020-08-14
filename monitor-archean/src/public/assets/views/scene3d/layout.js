
const lenOr0 = arr => {
  if (!arr) return 0;
  return arr.filter(slot => slot.tag).length;
}

export const Layout = {
  name: "Layout",
  inject: ["state3d", "ready"],
  provide() {
    return {
      numRows: this.numRows
    };
  },
  render(h) {
    // console.log("render Layout ");
    //Layout needs some DOM content to track live changes
    const slots = this.ready.loaded ? this.$slots.default : [];
    let index = 0;
    slots.forEach((vn, idx) => {
      if (vn.componentOptions) {
        vn.componentOptions.propsData = {idx: index++};
      }
    });
    return h("div", { style: { display: "none" } }, slots);
  },
  methods: {
    numRows() {
      return lenOr0(this.$slots.default);
    }
  }
};

export const Row = {
  name: "Row",
  inject: ["state3d", "numRows"],
  props: ["idx"],
  provide() {
    return {
      numBoxes: this.numBoxes,
      rowIdx: this.rowIdx
    };
  },
  render(h) {
    // console.log("render Row ", this.idx);
    this.state3d.stage.adjustRow(this.idx, this.numBoxes());
    const slots = this.$slots.default || [];
    let index = 0;
    slots.forEach((vn, idx) => {
      if (vn.componentOptions) {
        vn.componentOptions.propsData.idx = index++;
      }
    });
    return h("i", slots);
  },
  methods: {
    numBoxes() {
      const d = this.$slots.default;
      const result =  lenOr0(d);
      console.log("Num boxes for row "+this.idx+": "+result)
      return result;
    },
    rowIdx() {
      return this.idx;
    }
  }
};

export const Box = {
  name: "Box",
  props: ["name", "size", "altitude", "idx"],
  inject: ["state3d", "rowIdx", "numRows", "numBoxes"],
  render(h) {
    // console.log("render box ", this.idx, this.name,  this.numBoxes(), this.numRows());
    if (this.numBoxes() !== 0) {
      const box3d = this.state3d.stage.renderBox(
        this.idx,
        this.rowIdx(),
        this.numBoxes(),
        this.numRows(),
        this.name,
        this.size
      );
      if (this.altitude) {
        box3d.position.y = parseFloat(this.altitude);
      }
    }
    return null;
  }
};

export const Cylinder = {
  name: "Cylinder",
  props: ["name", "size", "altitude", "idx"],
  inject: ["state3d", "rowIdx", "numRows", "numBoxes"],
  render(h) {
    // console.log("render cyl ", this.idx, this.name);
    if (this.numBoxes() !== 0) {
      const cyl = this.state3d.stage.renderCylinder(
        this.idx,
        this.rowIdx(),
        this.numBoxes(),
        this.numRows(),
        this.name,
        this.size
      );
      if (this.altitude) {
        cyl.position.y = parseFloat(this.altitude);
      }
    }
    return null;
  }
};


