import Handlers from './handlers.js'

export default function initSSE(uri) {
    const eventSource = new EventSource(uri)
    for (const handler of Handlers) {
        eventSource.addEventListener(handler.eventType, event => {
            handler.handle(event)
        })
    }
    return eventSource;
}