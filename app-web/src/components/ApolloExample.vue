<template>
  <div class="apollo-example">
    <p>ToDo Items</p>
    <!-- Apollo watched Graphql query -->
    <ApolloQuery
      :query="require('../graphql/Items.gql')"
    >
      <template slot-scope="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured {{error}}</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">
          <ul>
            <li v-for="item in items" :key="item.id">
              {{item.id}} -  {{item.item}} - {{item.status}}
            </li>
          </ul>
        </div>

        <!-- No result -->
        <div v-else class="no-result apollo">No result :(</div>
      </template>
    </ApolloQuery>

  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data () {
    return {
      items: []
    }
  },

  apollo: {
    $subscribe: {
      tags: {
        query: gql(`subscription ItemSubscription  {
          Items {
            id
            item
            status
          }
        }`),
        result ({ data }) {
          // eslint-disable-next-line no-console
          console.log('received:',data);
          this.items = data.Items;
        },
      },
    }
  },

  computed: {

  },

  methods: {
    onItemAdded (previousResult, { subscriptionData }) {
      return {
        messages: [
          ...previousResult.items,
          subscriptionData.data.itemAdded,
        ],
      }
    }
  },
}
</script>

<style scoped>
.form,
.input,
.apollo,
.message {
  padding: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
}

.input {
  font-family: inherit;
  font-size: inherit;
  border: solid 2px #ccc;
  border-radius: 3px;
}

.error {
  color: red;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
  grid-gap: 10px;
}

.image-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  border-radius: 8px;
}

.image {
  max-width: 100%;
  max-height: 100%;
}

.image-input {
  margin: 20px;
}
</style>
