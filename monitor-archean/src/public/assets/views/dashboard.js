import apps from "./dash-apps.js"
import pods from "./dash-pods.js"
import deployments from "./dash-deploys.js"


export default { template: `
     <div class="dashboard">
        <apps/>
        <pods/>
        <deployments/>                                              
     </div>
    `,
    components: {
        apps: apps,
        pods: pods,
        deployments: deployments
    }
}