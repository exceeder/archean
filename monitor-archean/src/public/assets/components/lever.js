export default Vue.component('lever', { template: `
  <div class="switch right">
    <label>
      {{labelOff}}
      <input type="checkbox" v-model="state">
      <span class="lever"></span>
      {{labelOn}}
    </label>
   </div> 
`,
    props:{
        labelOff: {
            type: String,
            default: "off"
        },
        labelOn: {
            type: String,
            default: "on"
        },
        value: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        state: {
            get () { return this.value },
            set (value) { this.$emit('update:value', value) }
        }
    },
})