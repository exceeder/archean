
new Vue({
    template:`
      <section class="container">
          <h2>Vue Web App</h2>
          <p>
            The card below contains the response from a microservice in 'app-hello/' directory.            
          </p>          
          <div class="row">          
            <div class="col s12 m6">
               <div class="card blue-grey darken-1">
                  <div class="card-content white-text"> 
                    <span class="card-title">Hello-App Microservice</span>               
                    <p>Hello app says: Hello, {{ message.hello }}</p>
                    <p>IP: <i>{{ message.ip }}, date: {{ message.ts }}</i></p>
                    <div class="card-action">
                        <a href="#" @click="fetchItems">Refresh</a>                       
                        <a href="/archean/index.html" target="_blank">Open Monitor</a>                     
                    </div>          
                  </div>
               </div>   
            </div>
            
          </div>
      </section>
    `,
    el: '#app',
    data() {
        return {
            message: {}
        }
    },
    created() {
        this.fetchItems();
    },
    methods: {
        fetchItems() {
            fetch("/hello").then(res => res.json()).then(res => {
                this.message = res;
            });
        }
    }
});