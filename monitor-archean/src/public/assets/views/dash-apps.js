import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<h5>Microservices</h5>
<div class="flex-wrap">
   <app-card v-for="app in apps" :key="app.baseUrl" :title="app.prefix">             
       <ul class="left-align">                   
           <li>Link: <a :href="app.prefix">{{app.prefix}}</a></li>                   
           <li>Base url: {{app.baseUrl}}</li>                   
           <li>Last pings: {{ lastPings(app) }}</li>
           <li>Count: {{app.requestCount}}</li>
       </ul>               
   </app-card>
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
        apps () { return store.state.apps.filter(app => !this.filtered || app.prefix.includes('hello')); }
    },
    methods: {
        refreshApps: () => store.dispatch('updateApps'),
        lastPings: app => Object.values(app.pods).map(p => `${(Date.now() - p.lastPing) / 1000}s ago`).join(",")
    }
}