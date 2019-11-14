describe('The Home Page', function() {
    it('successfully loads', function() {
        cy.visit('http://api-gateway:3000/archean/')
        cy.get('#logo-container').contains('Dashboard').click()
        cy.screenshot()
    })
})