export default Vue.component('app-card', { template: `
   <div class="card">
     <div :class="['card-content', align]">
      <span v-if="title !== ''" class="card-title">{{ title }}</span>
      <slot></slot>       
     </div>
   </div>  
`,
props:{
    title: {
        type: String,
        default: ""
    },
    align: {
        type: String,
        default: 'center-align'
    }
}})