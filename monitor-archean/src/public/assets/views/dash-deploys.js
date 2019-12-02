import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<h5>Deployments</h5> 
<div class="flex-wrap">
   <app-card v-for="dep in deployments" :key="dep.metadata.name" :title="dep.metadata.name">             
       <ul class="left-align">                   
           <li>Replicas: {{dep.spec.replicas}}</li>                   
           <li>Availablity: {{ dep.status.conditions.map(c => c.type + ':' + c.message).join('; ') }}</li>
       </ul>               
   </app-card>
</div>
<a class="right" href="#monitor" @click="refreshDeployments()">reload</a>
</section>
`,
    store,
    props: {
        filtered: Boolean
    },
    computed: {
        deployments () { return store.state.deployments.filter(d => !this.filtered || d.metadata.name.includes('hello')) }
    },
    methods: {
        refreshDeployments: () => store.dispatch('updateDeployments')
    }
}