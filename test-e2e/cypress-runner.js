const redis = require('redis');
const chokidar = require('chokidar');
const resultsPublisher = require('./rest/tests-e2e-api')
const MAX_LOG_SIZE = 100

process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});

let cypress = null;
function runCypress() {
    cypress = require('child_process').spawn('cypress', ['run'], {
        detached: true
    });

    const redisClient = redis.createClient({host: "backend-redis", port: 6379})
    const logToRedis = (data, onDone) => {
        redisClient.rpush("tests-e2e", data, (err, len) => {
            //limit log length in Redis
            if (len > MAX_LOG_SIZE) {
                redisClient.ltrim("tests-e2e", len-MAX_LOG_SIZE, -1, (err, v) => {
                    //console.log("del",v)
                    redisClient.incr("tests-e2e-counter", () => {
                        resultsPublisher.notify();
                        onDone && onDone();
                    });
                });
            } else {
                resultsPublisher.notify();
                onDone && onDone();
            }

        })
    }

    cypress.stdout.on('data', data => {
        logToRedis(data);
    });

    logToRedis("\n>> Cypress "+cypress.pid+" started\n");

    cypress.on('close', (code, signal) => {
        logToRedis("\n<< Cypress " + cypress.pid + " stopped with code:"+code+"\n\n", () => {
            redisClient.quit()
        });
    });
}

function stopCypress() {
    if (cypress !== null) {
        cypress.kill()
        cypress = null
    }
}

function onTestFilesChanged() {
    stopCypress();
    runCypress();
}

// file watcher and test runner
(() => {
    let delayedRestart;
    chokidar.watch('./cypress/integration', {
        awaitWriteFinish: true
    }).on('all', (event, path) => {
        console.log("Detected e2e test change:", event, path);
        clearTimeout(delayedRestart);
        delayedRestart = setTimeout(() => onTestFilesChanged(), 500);
    });
})();
