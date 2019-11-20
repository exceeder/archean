export default Vue.component('expandable-image', { functional: false,
    inheritAttrs:false,
    template: `
  <div class="expandable-image" :class="{ expanded }" @click="expanded = true">
    <i v-if="expanded" class="close-button">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24" >
        <path fill="#666666"
          d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
      </svg>
    </i>
    <img v-bind="$attrs"/>
  </div>
`,
    data() {
        return {
            expanded: false
        }
    },
    methods: {
        closeImage (event) {
            this.expanded = false
            event.stopPropagation()
        },
        freezeVp (e) {
            e.preventDefault()
        }
    },
    watch: {
        expanded(status) {
            this.$nextTick(() => {
                if (status) {
                    this.cloned = this.$el.cloneNode(true)
                    this.closeButtonRef = this.cloned.querySelector('.close-button')
                    this.closeButtonRef.addEventListener('click', this.closeImage)
                    document.body.appendChild(this.cloned)
                    document.body.style.overflow = 'hidden'
                    this.cloned.addEventListener('touchmove', this.freezeVp, false);
                    setTimeout(() => {
                        this.cloned.style.opacity = 1
                    }, 0)
                } else {
                    this.cloned.style.opacity = 0
                    this.cloned.removeEventListener('touchmove', this.freezeVp, false);
                    setTimeout(() => {
                        this.closeButtonRef.removeEventListener('click', this.closeImage)
                        this.cloned.remove()
                        this.cloned = null
                        this.closeButtonRef = null
                        document.body.style.overflow = 'auto'
                    }, 250)
                }
            })
        }
    }
})