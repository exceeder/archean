//note that Cypress runs inside the cluster, so, we use internal service name and port to access gateway's cluster

describe('Query micro works', function() {
    it('successfully loads', function() {
        cy.request('http://api-gateway:3000/query').then((response) => {
            expect(response.status).to.eq(200)
            expect(response.headers['content-type']).to.contain('application/json')
            expect(response.body).to.not.be.null
            expect(response.body).to.have.property('query')
        })
    })
})