export default Vue.component('modal', { template: `
    <div id="podDetails" class="modal" style="display: block; z-index: 1000" v-show="visible">
        <div class="modal-content">
         <slot></slot>
         <pre @click="$emit('close')">{{ JSON.stringify(data,0,2) }}</pre>
        </div>
        <div class="modal-footer">
          <span @click="$emit('close')" class="modal-close waves-effect waves-green btn-flat">Close</span>
        </div>
    </div>
    `,
    props: ['data'],
    data() {
        return {
            visible: true
        }
    }
})