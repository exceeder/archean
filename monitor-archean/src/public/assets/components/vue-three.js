//Vue wrapper around https://gionkunz.github.io/chartist-js/
export default function (options = {}) {
    const defaultOptions = { messageNoData: '', classNoData: 'ct-nodata' }
    options = Object.assign({}, defaultOptions, options)

    Vue.THREE = window.THREE;

    Vue.component('Three', {
        props: {
            data: {
                type: Object,
                default () {
                    return {
                        nodes: [],
                        edges: []
                    }
                }
            },
            eventHandlers: {
                type: Array,
                default () {
                    return []
                }
            }
        },
        data () {
            return {
                error: { onError: false, message: '' }
            }
        },
        watch: {
            data: { handler: 'redraw', deep: true },
            eventHandlers: 'resetEventHandlers'
        },
        mounted () {
            this.draw()
        },
        methods: {
            clear () {
                if (this.error.onError) {
                    this.error = { onError: false, message: '' }
                }
            },
            draw () {
                if (this.haveNoData()) {
                    return this.setNoData()
                }
                this.clear()
                this.chart = new this.$chartist[this.type](this.$refs.chart, this.data, this.options, this.responsiveOptions)
                this.setEventHandlers()
            },
            haveNoData () {
                return !this.data ||
                    !this.data.series ||
                    this.data.series.length < 1 ||
                    (
                        (this.type !== 'Pie' && !this.options.distributeSeries) &&
                        this.data.series.every(series => {
                            if (Array.isArray(series)) {
                                return !series.length
                            }
                            return !series.data.length
                        })
                    )
            },
            redraw () {
                if (this.error.onError) {
                    return this.draw()
                } else if (this.haveNoData()) {
                    return this.setNoData()
                }
                this.clear()
                this.chart.update(this.data, this.options)
            },
            resetEventHandlers (eventHandlers, oldEventHandler) {
                if (!this.chart) {
                    return
                }
                for (let item of oldEventHandler) {
                    this.chart.off(item.event, item.fn)
                }
                for (let item of eventHandlers) {
                    this.chart.on(item.event, item.fn)
                }
            },
            setEventHandlers () {
                if (this.eventHandlers) {
                    for (let item of this.eventHandlers) {
                        this.chart.on(item.event, item.fn)
                    }
                }
            },
            setNoData () {
                this.error = { onError: true, message: options.messageNoData }
                this.noData = true
                this.message = this.error.message
            }
        },
        render (h) {
            const children = this.message || this.$slots.default || [];

            return h('div', {
                ref: 'chart',
                'class': [
                    this.ratio,
                    { [this.classNoData]: this.noData }
                ]
            }, children)
        }
    })
}