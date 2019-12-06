import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<!--<h5>Microservices</h5>-->
<div class="flex-wrap" style="justify-content: center">
   <div class="sub-card z-depth-2" v-for="app in apps" :key="app.prefix" :data-title="app.prefix">             
       <ul class="left-align">                   
           <li><b>Proxy:</b> <a :href="app.prefix">{{app.prefix}}</a> &rarr;                 
           <span v-for="pod in Object.values(app.pods)">{{pod.baseUrl}}<br/></span></li>                   
           <li><b>Pings:</b> {{ lastPings(app) }}</li>
           <li><b>Count:</b> {{app.requestCount}}</li>
       </ul>               
   </div>
</div>
 <a class="right" href="#monitor" @click="refreshApps()">reload</a>
</section> 
`,
    store,
    props: {
        filtered: Boolean,
    },
    mounted() {
        this.refreshApps();
    },
    computed: {
        apps () { return store.getters.focusedApps }
    },
    methods: {
        refreshApps: () => store.dispatch('updateApps'),
        lastPings: app => Object.values(app.pods).map(p => `${( (Date.now() - p.lastPing) / 1000).toFixed(1)}s ago`).join(", "),
    }
}