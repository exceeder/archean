//note that Cypress runs inside the cluster, so, we use internal service hostname and port as per service.yaml

describe('Hello app works', function () {

    beforeEach(() => {
        cy.request('http://api-gateway:3000/hello').as('hello')
    })

    it('returns JSON headers', function () {
        cy.get('@hello')
            .its('headers')
            .its('content-type')
            .should('include', 'application/json')
    })

    it('returns hello ', function () {
        cy.get('@hello')
            .its('body')
            .its('hello').should("eq","World!")
            .its("ip").should('not.be.null')
    })
})