//note that Cypress runs inside the cluster, so, we use internal service name and port to access gateway's cluster
describe('Archean Monitor page opens', function() {
    it('successfully loads', function() {

        cy.visit('http://api-gateway:3000/archean/')

        cy.get('.nav-wrapper').contains('Overview').click()
        cy.wait(250)

        cy.get('.nav-wrapper').contains('Monitor').click()
        cy.get('.dashboard').contains('Deployments')

        cy.get('.nav-wrapper').contains('E2E Tests').click()
        cy.get('.dashboard .card-tabs').contains('Logs').click()
        cy.get('.dashboard .card-tabs').contains('Videos').click()
        cy.get('.dashboard .card-tabs').contains('Screenshots').click()
        cy.screenshot()
    })
})