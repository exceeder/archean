---
to: <%= name %>/src/index.js
unless_exists: true
---
const http = require("http")

const URL = "http://api-gateway:3000/"
const REPEAT_INTERVAL = 10000; //ms
const EXIT_AFTER = 60500; //ms

console.log("job is starting")

const httpGet = (url) => new Promise(((resolve, reject) => {
    http.get(url, (resp) => {
        let data = ''
        resp.on('data', (chunk) => { data += chunk })
        resp.on('end', () => {
           resolve({response:resp, payload:data} );
        });
    }).on("error", (err) => {
        reject(err);
    });
}))

let interval = setInterval(async () => {
    try {
        const result = await httpGet(URL);
        console.log(`Received ${result.payload.length} bytes with status ${result.response.statusCode} from ${URL}`)
    } catch (err) {
        console.error("Error: " + err.message)
    }
    console.log(`...subtask completed at ${process.env.MY_POD_IP} : ${new Date().toLocaleString()}`)
}, REPEAT_INTERVAL)

setTimeout(() => {
    console.log(`Exiting job after running for ${EXIT_AFTER/1000}s at ${process.env.MY_POD_IP} : ${new Date().toLocaleString()}`)
    clearInterval(interval);
    process.exit()
}, EXIT_AFTER)