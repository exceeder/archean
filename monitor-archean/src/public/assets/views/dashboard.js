import apps from "./dash-apps.js"
import pods from "./dash-pods.js"
import deployments from "./dash-deploys.js"
import tests from "./dash-tests.js"
import dash3d from "./dash-3d.js"

export default { template: `
     <div class="dashboard">        
        <div class="tab" v-show="'monitor' === activeTab">
            <apps/>
            <pods/>
            <deployments/>     
        </div>
        <div class="tab" v-show="'overview' === activeTab">
           <dash3d v-if="'overview' === activeTab"/>
        </div>
        <div class="tab" v-show="activeTab.startsWith('e2e-')">
          <tests/>
        </div>                                         
     </div>
    `,
    components: {
        apps: apps,
        pods: pods,
        deployments: deployments,
        tests: tests,
        dash3d: dash3d
    },
    props: {
        activeTab: String
    }
}