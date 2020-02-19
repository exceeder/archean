import store from "../stores/dashboard-store.js"
import apps from "./dash-apps.js"
import pods from "./dash-pods.js"
import deployments from "./dash-deploys.js"
import tests from "./dash-tests.js"
import dash3d from "./dash-3d.js"
import initSSE from "../eventsource/sse.js"

export default { template: `
     <div class="dashboard"> 
        <modal v-if="modalVisible" @close="modalVisible = false" :data="modalData"/>
        <div class="tab" v-show="'monitor' === activeTab">
            <div class="row">
            <div class="col s12 m8">             
                <div class="flex-wrap hide-on-small-only">           
                   <app-card style="width:100%">
                       <div style="display:block; height: 2em">
                           <span class="left">Gateway Rules</span>
                           <lever labelOff="All" labelOn="Focused" :value.sync="filtered"/>   
                       </div>                         
                       <apps :filtered="filtered"/>                                  
                   </app-card>
                </div>                                       
                <deployments :filtered="filtered"/>
            </div>
            <div class="col m4 hide-on-small-only">
              <div class="card right-vertical" style="">
                <b>Events</b>
                <div class="collection">
                  <div class="collection-item" v-for="ev in $store.getters.recentEvents" @click="showDetails(ev)">
                    <i style="color:#ccc">{{ago(ev.ts)}} </i> <span> {{ev.etype}}  {{ev.action}} <i>{{ev.name}}</i> </span>
                  </div>
                </div>
              </div>
            </div>
            </div>     
        </div>
        <div class="tab" v-show="'overview' === activeTab">
           <dash3d v-if="'overview' === activeTab"/>
        </div>
        <div class="tab" v-show="activeTab.startsWith('e2e-')">
          <tests/>
        </div>                                         
     </div>
    `,
    store,
    data() {
        return {
            modalVisible: false,
            modalData: null
        }
    },
    components: {
        apps: apps,
        pods: pods,
        deployments: deployments,
        tests: tests,
        dash3d: dash3d
    },
    props: {
        activeTab: String
    },
    mounted() {
        store.commit('initialiseStore');
        this.sse = initSSE('/archean/v1/events')
    },
    computed: {
        filtered: {
                get () { return  store.state.filtering.focused },
                set (value) { store.dispatch('setFiltering', value) }
        }
    },
    methods: {
        ago(ts) {
            const time = new Date(ts)
            const hh = time.getHours();
            const mm = time.getMinutes().toFixed(0).padStart(2, '0');
            const ss = time.getSeconds().toFixed(0).padStart(2, '0');
            return `${hh}:${mm}:${ss}`
        },
        showDetails(ev) {
            this.modalData = ev.data.status
            this.modalVisible = true
        }
    },
    beforeDestroy() {
        this.sse.close()
    }
}