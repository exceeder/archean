
new Vue({
    template:`
      <section class="container">
          <h2>Demo Web App</h2>
          <p>Welcome to the demo app!</p>
          <ul>
            <li><a href="/archean/index.html">Monitor</a></li>
          </ul>
      </section>
    `,
    el: '#app',
    data() {
        return {
            items:[]
        }
    },
    methods: {
        addItem() {

        }
    }
});