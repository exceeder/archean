import './components/app-header.js';
import './components/app-main.js';
import './components/app-footer.js';
import './components/app-card.js';
import Dashboard from './views/dashboard.js'

new Vue({
    el: '#app',
    components: {
        'dashboard': Dashboard,
    }
});