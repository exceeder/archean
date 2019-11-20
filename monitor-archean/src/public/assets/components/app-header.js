export default Vue.component('app-header', { functional: false, template: `
    <header>
      <nav class="blue-grey darken-2" role="navigation">
        <div class="nav-wrapper container">
          <a id="logo-container" href="#" class="brand-logo left">Integration Dashboard</a>
          <slot></slot>
        </div>       
      </nav>
    </header>
`})