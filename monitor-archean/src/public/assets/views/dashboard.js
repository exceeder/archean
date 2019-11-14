import store from "../stores/dashboard-store.js"


export default { template: `
     <div class="dashboard">
        <h5>
          <a class="waves-effect waves-light btn-small" @click="refreshApps()"><i class="material-icons refresh">refresh</i></a>
          Microservices
        </h5>
        <div class="flex-wrap">
           <app-card v-for="app in apps" :key="app.baseUrl" :title="app.prefix">             
               <ul class="left-align">                   
                   <li>Base url: {{app.baseUrl}}</li>                   
                   <li>Last ping: {{ (new Date().getTime() - app.lastPing) / 1000 }}s ago</li>
                   <li>Count: {{app.requestCount}}</li>
               </ul>               
           </app-card>
        </div>
        <h5>
          <a class="waves-effect waves-light btn-small" @click="refreshDeployments()"><i class="material-icons refresh">refresh</i></a> 
          Deployments
        </h5> 
        <div class="flex-wrap">
           <app-card v-for="dep in deployments" :key="dep.metadata.name" :title="dep.metadata.name">             
               <ul class="left-align">                   
                   <li>Replicas: {{dep.spec.replicas}}</li>                   
                   <li>Availablity: {{ dep.status.conditions.map(c => c.message).join('; ') }}</li>
               </ul>               
           </app-card>
        </div>
        <h5>
          <a class="waves-effect waves-light btn-small" @click="refreshPods()"><i class="material-icons refresh">refresh</i></a>
          Pods
        </h5>
        <div class="flex-wrap">
           <app-card v-for="pod in pods" :key="pod.metadata.name" :title="pod.metadata.labels.app">             
               <ul class="left-align">
                   <li>Name: {{pod.metadata.name}}</li>                  
                   <li>IP: {{pod.status.podIP}}</li>                  
                   <li>Status: {{pod.status.phase}}</li>                  
               </ul>
               <div class="card-action">
                  <a :href="'/archean/v1/pods/' + pod.metadata.name + '/logs'" target="_blank">Logs</a>          
               </div>
           </app-card>
        </div>                                                
     </div>
    `,
    store,
    mounted() {
        this.refreshApps();
        this.refreshPods();
        this.refreshDeployments();
    },
    computed: {
        apps() { return store.state.apps; },
        pods() { return store.state.pods; },
        deployments() { return store.state.deployments; }
    },
    methods: {
        refreshApps() {
            store.dispatch('updateApps')
        },
        refreshPods() {
            store.dispatch('updatePods')
        },
        refreshDeployments() {
            store.dispatch('updateDeployments')
        }

    }
}