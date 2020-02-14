import SparkLine from "../../components/sparkline.js"

export default {
    template: `
<div>      
  <h5>App</h5>
  <span class="info3d"></span>
  <table>
      <tr>
        <th>Time</th><th>Event</th>
      </tr>
      <tr>
        <td>10:45</td><td>started</td>
      </tr><tr>
        <td>10:41</td><td>initialized</td>
      </tr>
  </table>
  <div><sparkline/></div>
</div>
`,
    components: {
        'sparkline': SparkLine
    }
}