import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import { createProvider } from './vue-apollo'

Vue.config.productionTip = true

new Vue({
    vuetify,
    apolloProvider: createProvider(),
    render: h => h(App)
}).$mount('#app')