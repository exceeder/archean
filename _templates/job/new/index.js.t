---
to: <%= name %>/src/index.js
unless_exists: true
---
console.log("job is starting")
let interval = interval = setInterval(() => {
        console.log(`job completed at ${process.env.MY_POD_IP} : ${new Date()}`);
}, 10000)

setTimeout(() => {
    console.log(`Exiting job at ${process.env.MY_POD_IP} : ${new Date()}`)
    clearInterval(interval);
    process.exit()
},60500)