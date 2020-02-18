//note that Cypress runs inside the cluster, so, we use internal service hostname and port as per service.yaml

describe('Test1 app works', function () {

    beforeEach(() => {
        cy.request('http://api-gateway:3000/test1').as('test1')
    })

    it('It returns lists of users', function () {
        cy.get('@test1')
            .its('headers')
            .its('content-type')
            .should('include', 'application/json')
    })

    it('returns hello property', function () {
        cy.get('@test1')
            .its('body')
            .its('greeting')
            .should('equal', 'Hello from Test ABC1!')
            .should('not.be.null')
    })
})