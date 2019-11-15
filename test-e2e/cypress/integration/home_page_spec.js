//note that Cypress runs inside the cluster, so, we use internal service name and port to access gateway's cluster
describe('Monitor page opens', function() {
    it('successfully loads', function() {
        cy.visit('http://api-gateway:3000/archean/')
        cy.get('#logo-container').contains('Dashboard').click()
        cy.get('.dashboard').contains('Microservices');
    })
})