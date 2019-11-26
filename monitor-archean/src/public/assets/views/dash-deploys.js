import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<h5>Deployments</h5> 
<div class="flex-wrap">
   <app-card v-for="dep in deployments" :key="dep.metadata.name" :title="dep.metadata.name">             
       <ul class="left-align">                   
           <li>Replicas: {{dep.spec.replicas}}</li>                   
           <li>Availablity: {{ dep.status.conditions.map(c => c.message).join('; ') }}</li>
       </ul>               
   </app-card>
</div>
<a class="right" href="#monitor" @click="refreshDeployments()">reload</a>
</section>
`,
    store,
    mounted() {
        let to = null;
        this.refreshDeployments();
        this.sseSource = new EventSource('/archean/v1/events');
        this.sseSource.addEventListener('message', (msg) => {
            if (msg.data === 'PING') {
                store.dispatch('updateApps');
                return;
            }
            console.log(msg);
            const event = JSON.parse(msg.data);
            switch (event.action) {
                case 'DELETED':
                    store.dispatch('removeDeployment', event.name);
                    break
                case 'ADDED':
                case 'MODIFIED':
                    clearTimeout(to); //todo fix this plug!
                    to = setTimeout(() => {
                        store.dispatch('updateApps');
                        store.dispatch('updateDeployments');
                        store.dispatch('updatePods');
                    }, 1000);
                    break;
            }
        });

    },
    destroyed() {
      this.sseSource.close();
    },
    computed: {
        deployments: () => store.state.deployments
    },
    methods: {
        refreshDeployments: () => store.dispatch('updateDeployments')
    }
}