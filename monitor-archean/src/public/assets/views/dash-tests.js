export default {
    template: `
<section>
<div class="flex-wrap">
   <app-card>
     <div class="card-tabs">               
       <ul class="tabs tabs-fixed-width">
         <li class="tab"><a href="#e2e-logs" @click="selectTab('e2e-logs')">Logs</a></li>
         <li class="tab"><a href="#e2e-videos" @click="selectTab('e2e-videos')">Videos</a></li>
         <li class="tab"><a href="#e2e-screenshots" @click="selectTab('e2e-screenshots')">Screenshots</a></li>
       </ul>  
     </div>

       <div class="left-align auto-scroll" id="e2e-logs" ref="log" v-show="tab === 'e2e-logs'">
         <pre v-html="htmlLogs">
         downloading...
         </pre>
       </div>
       <div id="e2e-videos" class="left-align auto-scroll" v-show="tab === 'e2e-videos'">
         <ul>
          <li v-for="file in files" v-if="file.endsWith('.mp4')">
            <video width="640" style="margin:1em" controls autoplay>
              <source :src="'/tests/e2e/files/'+file" type="video/mp4">
              Video not supported
            </video>          
          </li>
         </ul>
       </div>
       <div id="e2e-screenshots" class="left-align auto-scroll" v-show="tab === 'e2e-screenshots'">
          <div v-for="file in files" v-if="file.endsWith('.png')" style="display: inline-block; padding:0.5em">
            <expandable-image class="image" :src="'/tests/e2e/files/' + file" :title="'/tests/e2e/files/' + file"/>            
          </div>
       </div>

   </app-card>
</div>
</section>  
`,
    data() {
      return {
          logs: '',
          files: [],
          tab: location.hash.startsWith('#e2e') ? location.hash.substr(1) : 'e2e-logs'
      }
    },
    created() {
        //fetch('/tests/e2e/html').then(res => res.text()).then(res => this.logs = res)
        this.connectSse();
        this.lastPing = Date.now()
        setInterval(() => {
            if (new Date().getTime() - this.lastPing > 2500) {
                if (this.sseSource) this.sseSource.close();
                this.connectSse();
            }
        },1000);
    },
    updated() {
        const elem = this.$refs.log
        elem.scrollTop = elem.scrollHeight-elem.clientHeight;
    },
    destroyed() {
        this.sseSource.close();
    },
    computed: {
        htmlLogs() {
            return this.logs;
        }
    },
    methods: {
        selectTab(tab) {
            if (tab !== 'e2e-logs') {
                fetch('/tests/e2e/files')
                    .then(res => res.json())
                    .then(res => this.files = res)
                    .then(() => this.tab = tab)
            } else {
                this.tab = tab
            }
        },
        connectSse() {
            console.log("Reset SSO!")
            this.sseSource = new EventSource('/tests/e2e/html/stream')
            this.lastPing = new Date().getTime()
            this.sseSource.addEventListener('message', (e) => {
                if (e.data === 'PING') {
                    this.lastPing = Date.now();
                } else {
                    console.log(e);
                    this.logs += JSON.parse(e.data);
                }
            });
        }
    }
}