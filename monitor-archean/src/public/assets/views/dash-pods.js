import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<h5>
  <a class="btn-floating btn-small waves-effect waves-light right" @click="refreshPods()"><i class="material-icons refresh">refresh</i></a>
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
</section>  
`,
    store,
    mounted() {
        this.refreshPods();
    },
    computed: {
        pods: () => store.state.pods
    },
    methods: {
        refreshPods: () => store.dispatch('updatePods')
    }
}