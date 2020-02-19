//note that Cypress runs inside the cluster, so, we use internal service hostname and port as per service.yaml

describe('Hello app works', function () {

    beforeEach(() => {
        cy.request('http://api-gateway:3000/hello').as('hello')
    })

    it('returns JSON', function () {
        cy.get('@hello')
            .its('headers')
            .its('content-type')
            .should('include', 'application/json')
    })

    it('returns hello property', function () {
        cy.get('@hello')
            .its('body')
            .its('hello')
            .should('not.equal', '')
            .should('not.be.null')
    })
})