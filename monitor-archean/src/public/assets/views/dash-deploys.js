import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<modal v-if="modalVisible" @close="modalVisible = false" :data="modalData" style="top:10em"/>       
<h5>Deployments</h5> 
<div class="flex-wrap">
   <app-card v-for="dep in deployments" :key="dep.metadata.name" :title="dep.metadata.name">             
       <ul class="left-align">                   
           <li>Replicas: {{dep.spec.replicas}}</li>                   
           <li v-if="dep.status.conditions" class="truncate">
<!--             <table class="striped" style="">-->
<!--                <tr><th>type</th><th>status</th><th>reason</th><th>message</th></tr>-->
<!--                <tr v-for="c in dep.status.conditions"><td>{{c.type}}</td><td>{{c.status}}</td><td>{{c.reason}}</td><td class="truncate">{{c.message}}</td></tr>-->
<!--             </table>-->
             {{dep.status.conditions[0].message}}
           </li>
           <li>
              <br/>
              <span v-for="pod in pods(dep)" :key="pod.status.podIP" class="chip" @click="podClick(pod)">
                {{pod.status.podIP}} 
                <i v-if="pod.metrics">{{fmtCpu(pod.metrics.cpu)}}  {{fmtMem(pod.metrics.memory)}}</i>
                <i v-else>{{pod.status.phase}}</i>       
              </span>
           </li>
       </ul>
       <a class="right" href="#monitor" @click="refreshDeployments()">reload</a>               
   </app-card>
</div>
</section>
`,
    store,
    data() {
        return {
            modalVisible: false,
            modalData: null
        }
    },
    props: {
        filtered: Boolean
    },
    computed: {
        deployments () { return store.getters.focusedDeployments }
    },
    methods: {
        refreshDeployments: () => {
            store.dispatch('updateDeployments')
            store.dispatch('updateMetrics')
        },
        pods(dep) { return store.getters.getPodsByDeploymentName(dep.metadata.name) },
        podClick(pod) {
            this.modalData = pod.metadata
            this.modalVisible = true
        },
        fmtMem(str) {
            if (str && str.endsWith("Ki")) {
                return (str.substring(0, str.length-2) / 1000).toFixed(2)+"M"
            } else
                return str;
        },
        fmtCpu(str) {
            if (str && str.endsWith("n")) {
                return (str.substring(0, str.length-1) / 1000).toFixed(1)+"m"
            } else
                return str;
        }
    }
}