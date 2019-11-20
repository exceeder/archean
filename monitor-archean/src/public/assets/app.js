import './components/app-header.js';
import './components/app-main.js';
import './components/app-footer.js';
import './components/app-card.js';
import './components/expandable-image.js';
import Dashboard from './views/dashboard.js'

new Vue({
    el: '#app',
    components: {
        'dashboard': Dashboard,
    },
    data() {
        return {
            currentTab: location.hash !== '' ? location.hash.substr(1) : 'monitor'
        }
    },
    methods: {
        selectTab(selectedTab) {
            this.currentTab = selectedTab;
        }
    }
});