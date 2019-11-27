class MonitorEvent {
    constructor(action, type, name, ts, data) {
        this.action = action; //ADDED, DELETED, MODIFIED
        this.type = type; //deployment, pod, service, micro
        this.name = name; //unique name
        this.ts = ts; //timestamp
        this.data = data;
    }

    asJson() {
        return JSON.stringify(this);
    }
}

module.exports = MonitorEvent;