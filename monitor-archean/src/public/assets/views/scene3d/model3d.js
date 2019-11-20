
const arrayDiff = (a, b) => [...a.filter(x => !b.includes(x)), ...b.filter(x => !a.includes(x))]

class Model {

    constructor() {
        //nodes matrix to build out node cubes. For now 3 layers: front, middle tier, back
        this._nodes = [
            ['api-gateway'],
            ['micro-hello1','micro-hello2','micro-hello3'],
            ['backend-redis']];
        //parallax page state
        this._pageState = "";
        this._particles = true;
        this._spheres = false;
        this.listeners = new Map();
    }

    on(event,listener) {
        this.listeners.set(event,listener);
    }

    set pageState(state) {
        this._pageState = state;
        this.emit('pageState', state);
    }

    get pageState() {return this._pageState;}

    get spheres() {return this._spheres;}
    set spheres(value) {this._spheres = value;}
    get particles() {return this._particles;}
    set particles(value) {this._particles = value;}

    //--- nodes ---
    setNodes(row,nodes) {
        const diff = arrayDiff(this._nodes[row],nodes);
        this._nodes[row] = nodes;
        diff[1].forEach(node => this.emit('removed',{row:row, node:node}))
        diff[0].forEach(node => this.emit('added',{row:row, node:node}))
    }
    get nodes() {
        return this._nodes;
    }

    emit(event, data) {
        this.listeners.has(event) && this.listeners.get(event)(data)
    }
}

const model = new Model();
export default model; //singleton

