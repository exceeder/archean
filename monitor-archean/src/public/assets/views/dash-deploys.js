import store from "../stores/dashboard-store.js"

export default {
    template: `
<section>
<modal v-if="modalVisible" @close="modalVisible = false" :data="modalData" :title="modalTitle" style="top:10em"/>       
<h5>Deployments</h5> 
<div class="flex-wrap">
   <app-card v-for="dep in deployments" :key="dep.metadata.name" :title="dep.metadata.name">             
       <ul class="left-align">                   
           <li>Replicas: {{dep.spec.replicas}}</li>                   
           <li v-if="dep.status.conditions" class="truncate hide-on-small-only">
<!--             <table class="striped" style="">-->
<!--                <tr><th>type</th><th>status</th><th>reason</th><th>message</th></tr>-->
<!--                <tr v-for="c in dep.status.conditions"><td>{{c.type}}</td><td>{{c.status}}</td><td>{{c.reason}}</td><td class="truncate">{{c.message}}</td></tr>-->
<!--             </table>-->
             {{dep.status.conditions[0].message}}
           </li>
           <li>    
              <span v-for="pod in pods(dep)" :key="pod.status.podIP" class="chip" 
                    @click="podClick($event, pod)" style="cursor: pointer">
                {{pod.status.podIP}}
                <i v-if="pod.metrics.cpu">{{fmtCpu(pod.metrics.cpu)}} {{fmtMem(pod.metrics.memory)}}</i>
                <i v-else>{{pod.status.phase}}</i>       
              </span>
           </li>
       </ul>
<!--       <a class="right" href="#monitor" @click="refreshMetrics()">reload</a>               -->
   </app-card>
</div>
</section>
`,
    store,
    data() {
        return {
            modalVisible: false,
            modalData: null,
            modalTitle: null
        }
    },
    props: {
        filtered: Boolean
    },
    computed: {
        deployments () { return store.getters.focusedDeployments }
    },
    created() {
        clearInterval(this.$options.interval)
    },
    methods: {
        refreshDeployments: () => {
            store.dispatch('updateDeployments')
        },
        showLogs(pod) {
            const vm = this;
            const url = '/archean/v1/pods/' + pod.metadata.name + '/logs'
            fetch(url).then(res => res.text()).then(log => {
                vm.modalData = log
                vm.modalTitle = pod.metadata.name + ' logs'
                vm.modalVisible = true
            }).catch(err => {
                vm.modalData = err.message
                vm.modalVisible = true
            })
        },
        pods(dep) { return store.getters.getPodsByDeploymentName(dep.metadata.name) },
        podClick(e, pod) {
            if (e.altKey) {
                this.modalTitle = pod.metadata.name + ' settings'
                this.modalData = pod
                this.modalVisible = true
            } else {
                this.showLogs(pod);
            }
        },
        fmtMem(str) {
            if (str && str.endsWith("Ki")) {
                return (str.substring(0, str.length-2) / 1000).toFixed(1)+"MB"
            } else
                return str;
        },
        fmtCpu(str) {
            if (str && str.endsWith("n")) {
                return (str.substring(0, str.length-1) / 1000000).toFixed(1)+"m"
            } else
                return str;
        }
    }
}