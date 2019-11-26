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
           <li>Last ping: {{ (new Date().getTime() - app.lastPing) / 1000 }}s ago</li>
           <li>Count: {{app.requestCount}}</li>
       </ul>               
   </app-card>
</div>
 <a class="right" href="#monitor" @click="refreshApps()">reload</a>
</section> 
`,
    store,
    mounted() {
        this.refreshApps();
    },
    computed: {
        apps: () => store.state.apps
    },
    methods: {
        refreshApps: () => store.dispatch('updateApps')
    }
}