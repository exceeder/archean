let currentTarget = null

const NanoVue = {
    createApp(component) {
        currentTarget = component
        let state = component.setup()
        currentTarget = null

        const app = {
            ...state,
            component,
            mount: (selector) => {
                const container = document && document.querySelector(selector);
                component.template = container.innerHTML;
                component.$el = container;
                container.innerHTML = '';
                const hooks = component["mounted"]; //see createHook()
                if (hooks) hooks.forEach(h => h());
            }
        }
        window.app = app;
        return app;
    }
}

const effects = new WeakMap();
let effectSubscriber = null;

function reactive(target) {
   const handlers = {
       set: function(obj, prop, val) {
           const dirtFn = effects.get(obj)
           if (dirtFn) dirtFn();
           obj[prop] = val;
           return true;
       },
       get: function(obj, prop) {
           if (effectSubscriber) effectSubscriber(obj, prop);
           return obj[prop];
       }
   }
   return new Proxy(target, handlers);
}

// --- hooks ---
function injectHook(type, hook, target) {
    const hooks = target[type] || (target[type] = []);
    hooks.push(hook);
}
const createHook = (type) => (hook, target = currentTarget) => injectHook(type, hook, target)
const onMounted = createHook("mounted");

/**
 * Traces all dependencies of fn and ensures makeDirtyCb() is called when any value fn depends on changes
 * @param {function()} fn function to trace
 * @param {function} makeDirtyCb - callback to make function result dirty
 * @return {function(): *} to call when tracing is needed
 */
function trace(fn, makeDirtyCb) {
    return () => {
        effectSubscriber = (obj, prop) => effects.set(obj, makeDirtyCb)
        const val = fn();
        effectSubscriber = null;
        return val;
    }
}

function computed(getter) {
    let dirty = true
    let value = null;
    let tracer = trace(getter, () => dirty = true)
    return {
        get value() {
            if (dirty) {
                value = tracer ? tracer() : getter()
                dirty = false
                tracer = null
            }
            return value;
        },
        set value(newVal) { throw Error("Read-only") }
    }
}

const Count = {
    setup() {
        const status = reactive({
            count: 0,
            multiplier: 2,
            double: computed(() => {
                console.log("   ...recomputed")
                return status.count * status.multiplier
            })
        });

        function inc() {
            console.log("   ...incremented")
            status.count++;
        }

        onMounted( () => console.log("Mounted"))

        return {
            status,
            inc
        };
    }
}

const app = NanoVue.createApp(Count).mount('#app')

console.log(app.status.count, app.status.double.value)
app.inc()
console.log(app.status.count, app.status.double.value)
app.inc()
app.inc()
console.log(app.status.count, app.status.double.value)
app.status.count = 11
app.status.multiplier = 7
console.log(app.status.count, app.status.double.value)