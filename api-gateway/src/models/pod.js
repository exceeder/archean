class Pod {
    constructor(baseUrl) {
        this.baseUrl = baseUrl
        this.ping()
    }

    ping() {
        this.lastPing = Date.now()
    }
}

module.exports = Pod