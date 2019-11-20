/**
 * Class that contains information about proxy target, usually a microservice running on specific IP and port
 * @type {Target}
 */
class Target {
    constructor(baseUrl, prefix) {
        this.prefix = prefix
        this.requestCount = 0;
        this.ping(baseUrl)
    }

    translate(uri) {
        this.requestCount++;
        return this.baseUrl + uri
    }

    ping(baseUrl) {
        this.baseUrl = baseUrl
        this.lastPing = new Date().getTime()
    }
}

module.exports = Target