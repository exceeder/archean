
function initSSE(req, res, fetchEventsSince) {
    //SSE wrapper
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    res.write('\n');
    let lastId = req.headers["last-event-id"];
    const tabId = req.query.tabId;
    //console.debug(`subscribe tab:${tabId} for ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}, lastId: ${lastId}`);
    lastId = lastId || 0

    fetchEventsSince(lastId).then(data => {
        data.forEach(item => {
            res.write(`id: ${item.id}\n`);
            res.write(`data: ${JSON.stringify(item.message)}\n\n`);
            lastId = item.id;
        })
    }).catch(e => console.log(e))

    const intervalId = setInterval(() => {
        res.write(`event: PING\n`);
        res.write(`data: PING\n\n`);
    }, 5000);

    const sseStream = {
        send: (item) => {
            //console.log("2sending to ",tabId," item: ",item.id)
            res.write(`id: ${item.id}\n`);
            res.write(`data: ${JSON.stringify(item.message)}\n\n`);
            lastId = item.id;
        },
        close: () => {
            res.write('data:\n\n\n');
            res.end();
        },
        onClose: null
    }

    req.on('close', () => {
        console.log(`closed tab:${tabId} lastId: ${lastId}`);
        clearInterval(intervalId);
        sseStream.onClose && sseStream.onClose();
    });

    return sseStream;
}

module.exports = initSSE;