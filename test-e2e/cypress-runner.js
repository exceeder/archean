const createRedisClient = require('./rest/utils/redis-utils')
const chokidar = require('chokidar');
const resultsPublisher = require('./rest/tests-e2e-api')
const MAX_LOG_SIZE = 100

let redis = null;
let cypress = null;

async function spawnCypress() {
    cypress = require('child_process').spawn('cypress', ['run'], {
        detached: true
    });

    const logToRedis = async (data) => {
        try {
            let logSize = await redis.rpush("tests-e2e", data);
            let id = logSize;
            //limit log length in Redis to MAX_LOG_SIZE while keeping counter of removed lines in tests-e2e-counter
            //to maintain continuity with UI dashboards
            if (logSize > MAX_LOG_SIZE) {
                const trimSize = logSize - MAX_LOG_SIZE;
                let ok = await redis.ltrim("tests-e2e", trimSize, -1)
                if (ok === "OK") {
                    id = await redis.incrby("tests-e2e-counter", trimSize)
                }
            }
            resultsPublisher.notify({id: id, message: data});
        } catch (e) {
            console.log("Cannot log to Redis: ",e.message);
        }
    }

    await logToRedis("RESET");
    await logToRedis(`\n>> Cypress ${cypress.pid} started at ${new Date().toTimeString()} \n`);
    cypress.stdout.on('data', data =>  logToRedis(data.toString()))
    cypress.on('close',async (code, signal) => {
        await logToRedis("\n<< Cypress " + cypress.pid + " stopped with code:"+code+"\n\n")
    });
}

function stopCypress() {
    if (cypress !== null) {
        cypress.stdout.on('data', () => {});
        cypress.kill()
        cypress = null
    }
}

function onSpecFilesChange() {
    stopCypress();
    spawnCypress()
        .then(() => console.log("Cypress started."))
        .catch(e => console.log("Cypress startup failed: ",e))
}

// file watcher and test runner
function watchSpecFilesForChanges() {
    let delayedRestart = setTimeout(onSpecFilesChange, 1000); //initial startup if no changes detected
    chokidar.watch('./cypress/integration', {
        awaitWriteFinish: true
    }).on('all', (event, path) => {
        console.log("Detected e2e spec change:", event, path);
        clearTimeout(delayedRestart);
        delayedRestart = setTimeout(onSpecFilesChange, 500);
    });
}

//graceful error processing
process.on('uncaughtException', function(err) {
    console.error((err && err.stack) ? err.stack : err);
});

//graceful shutdown
process.on('SIGTERM',  () => {
    console.log(`(vvv) ${new Date()} shutting down ${process.env.MY_POD_IP}`)
    try {
        resultsPublisher.close();
        stopCypress();
        redis.client.quit();
    } catch (e) {
        console.log("(vvv) Shutdown error:",e);
    }
    console.log(`(vvv) ${new Date()} shutdown complete on ${process.env.MY_POD_IP}, exiting.`)
    process.exit();
});

createRedisClient().then(client => {
    redis = client;
    watchSpecFilesForChanges();
}).catch(e => console.log)
