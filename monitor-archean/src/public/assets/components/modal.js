export default Vue.component('modal', { template: `
    <div id="podDetails" class="modal modal-fixed-footer" style="display: block; z-index: 1000" v-show="visible">
        <div class="modal-content">
         <h5 v-if="title" @click="$emit('close')">{{ title }}</h5>
         <slot></slot>
         <pre v-if="typeof(data) === 'string'" v-html="data"></pre>
         <pre v-else>{{  JSON.stringify(data,0,2) }}</pre>
        </div>
        <div class="modal-footer">
          <span @click="$emit('close')" class="modal-close waves-effect waves-green btn-flat">Close</span>
        </div>
    </div>
    `,
    props: ['data', 'title'],
    data() {
        return {
            visible: true
        }
    }
})