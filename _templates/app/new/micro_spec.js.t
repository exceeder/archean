---
to: test-e2e/cypress/integration/apps/<%= name %>_micro_spec.json
unless_exists: true
---
describe('Hello app works', function () {

    beforeEach(() => {
        cy.request('http://api-gateway:3000/<%= name %>').as('<%= name %>')
    })

    it('endpoint <%= name %> is accessible', function () {
        cy.get('@<%= name %>')
            .its('body')
            .should('not.be.null')
    })
})