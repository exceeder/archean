<template>
  <v-app>
    <v-content>
      <v-layout>
        <v-flex xs12 sm6 offset-sm3>

          <v-card dark class="ma-4" color="blue-grey darken-1">
            <v-card-title>app-web demo</v-card-title>
            <v-card-text>
              <p>This web application is an example how to develop a frontend against
                a set of microservices using WebPack and Vuetify. It's source code is in `web-app/` module
                directory. Develop with `npm run serve` and `skaffold dev`, deploy with `skaffold run -p prod`.
              </p>
              <p>Hello app says: <b>Hello, {{ message.hello }}</b></p>
              <p>From IP: <b>{{ message.ip }}</b></p>
              <p>Timestamp: <b>{{ message.ts }}</b></p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn outlined color="orange lighten-2" @click="fetchItems">Refresh</v-btn>
                <v-btn outlined color="orange lighten-2" href="/archean/index.html" target="_blank">Open Monitor</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
    export default {
        name: 'App',

        data: () => ({
            message: { hello:"..." }
        }),

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
    };
</script>
