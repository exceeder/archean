import express from 'express'
import redis from 'redis'
import path from 'path'
const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"))

const port = 3000
const vuePort = process.env.VUE_PORT || port
const app = express()
//
app.use('/', express.static(path.join(__dirname, '../dist')))

//running heartbeat; message format is <your own url><CR><prefix>, e.g. "http://192.168.0.1:3000\n/app-web"
const publisher = redis.createClient({host:"backend-redis", port:6379})
publisher
    .on('error', (err) => console.log(err.message))
    .on('ready', () =>
        setInterval(() =>
            publisher.publish("heartbeat", `http://${process.env.MY_POD_IP}:${vuePort}\n/`), 2000)
    );

console.log("Serving app-web on "+vuePort)
//start listening for http requests
app.listen(port, '0.0.0.0', () => console.log(`Query at ${process.env.MY_POD_IP} listening on port ${port}!`))
