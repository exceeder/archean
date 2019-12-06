import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<h5>Pods</h5>
<div class="flex-wrap">
   <app-card v-for="pod in pods" :key="pod.metadata.name" :title="pod.metadata.labels.app">             
       <ul class="left-align">
           <li>{{pod.metadata.name}}</li>                  
           <li>{{pod.status.podIP}}</li>                  
           <li>{{pod.status.phase}}</li>                  
       </ul>
       <div class="card-action">
          <a :href="'/archean/v1/pods/' + pod.metadata.name + '/logs'" target="_blank">Logs</a>          
       </div>
   </app-card>
</div>
<a class="right" href="#monitor" @click="refreshPods()">reload</a>
</section>  
`,
    store,
    props: {
      filtered: Boolean
    },
    computed: {
        pods() { return [] //return store.getters.focusedPods
        }
    },
    methods: {
        refreshPods: () => store.dispatch('updatePods')
    }
}