import store from "../stores/dashboard-store.js"
import annotation from "./cards/annotation.js"
import {Row, Box, Layout, Cylinder} from "./scene3d/layout.js"
import stage3d from "./scene3d/stage3d.js"

//on this level, app business logic is provided

export default {
    template: `
<section>
    <stage3d>
      <!-- things -->
      <Layout>
        <Row>
          <Box name="api-gateway" /> 
        </Row> 
        <Row>
          <Box v-for="d in deployments" :key="d.metadata.uid" :name="d.metadata.labels.app" /> 
        </Row> 
        <Row>
           <Cylinder name="Redis" /> 
        </Row>     
      </Layout>
      <!-- annotation popups -->   
      <template #annotation>
          <annotation/>
      </template>
    </stage3d>
</section>
`,
    store,
    components: {stage3d, annotation, Row, Box, Layout, Cylinder},
    mounted() {
        store.dispatch("updatePods");
    },
    computed: {
        types: () => ['edge', 'micro', 'backend'],
        deployments: () => store.state.deployments.filter(d => d.metadata.labels['app-type'] === 'micro'),
        pods: () => store.state.pods
    }
}