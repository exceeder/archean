import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<h5>
  <a class="btn-floating btn-small waves-effect waves-light right" @click="refreshDeployments()"><i class="material-icons refresh">refresh</i></a> 
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
</section>
`,
    store,
    mounted() {
        this.refreshDeployments();
    },
    computed: {
        deployments: () => store.state.deployments
    },
    methods: {
        refreshDeployments: () => store.dispatch('updateDeployments')
    }
}