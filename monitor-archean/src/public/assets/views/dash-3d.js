import store from "../stores/dashboard-store.js"
import annotation from "./cards/annotation.js"
import {Row,Box,Layout} from "./scene3d/layout.js"
import stage3d from "./scene3d/stage3d.js"

//on this level, app business logic is provided

export default {
    template: `
<section>
    <stage3d>
      <!-- things -->
      <Layout>
        <Row>
          <Box v-for="pod in pods" :key="pod.status.podIP" :name="pod.metadata.labels.app"/> 
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
    components: {stage3d, annotation, Row, Box, Layout},
    mounted() {
        store.dispatch("updatePods");
    },
    computed: {
        deployments: () => store.state.deployments,
        pods: () => store.state.pods
    }
}