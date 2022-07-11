// https://docs.cypress.io/api/introduction/api.html

describe('Test suit',() => {
  it('Receive image and shows it at current-image div',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#import-image').should('not.exist')
  })

  it('Should update crop-window when a new aspect-ratio is created',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#add-aspect-ratio').click()
    cy.get('input[name=width]').type('{backspace}3')
    cy.get('input[name=height]').type('{backspace}4')
    cy.get('#confirm-button').click()
    cy.get('#crop-window').should('have.css','aspect-ratio','3 / 4')
  })

  it('Should show tooltips when hovering buttons',() => {
    expect(true).to.be.false
  })

  it('Should show next crop-window aspect ratio by clicking the next button if there are at least 2 aspect ratios',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#add-aspect-ratio').click()
    cy.get('input[name=width]').type('{backspace}1')
    cy.get('input[name=height]').type('{backspace}2')
    cy.get('#confirm-button').click()
    cy.get('input[name=width]').type('{backspace}3')
    cy.get('input[name=height]').type('{backspace}4')
    cy.get('#confirm-button').click()
    cy.get('#next').click()
    cy.get('#crop-window').should('have.css','aspect-ratio','3 / 4')
  })

  it('Should show previous crop-window aspect ratio by clicking the previous button if there are at least 2 aspect ratios',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#add-aspect-ratio').click()
    cy.get('input[name=width]').type('{backspace}3')
    cy.get('input[name=height]').type('{backspace}4')
    cy.get('#confirm-button').click()
    cy.get('input[name=width]').type('{backspace}1')
    cy.get('input[name=height]').type('{backspace}2')
    cy.get('#confirm-button').click()
    cy.get('#previous').click()
    cy.get('#crop-window').should('have.css','aspect-ratio','1 / 2')
  })

  it('Should display first JSON aspect ratio when JSON is used',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#import-json').click()
    cy.get('#json-container').type('{"ratios":[{"width":1,"height":2},{"width":3,"height":4}]}',{ parseSpecialCharSequences: false })
    cy.get('.aspect-ratio-item-active').first().should('have.text','1:2')
    cy.get('#crop-window').should('have.css','aspect-ratio','1 / 2')
  })

  it('Should display error message above JSON textarea if JSON is invalid',() => {
    cy.visit('/app')
    cy.get('#import-json').click()
    cy.get('#json-container').type('{"ratios":[{"width":1,"height":2},{"width":3,"height":4}]',{ parseSpecialCharSequences: false })
    cy.get('#json-error').should('exist')
  })

  it('Should remove all aspect-ratio-items when JSON is deleted or malformed',() => {
    expect(true).to.be.true
    cy.visit('/app')
    cy.get('#import-json').click()
    cy.get('#json-container').type('{"ratios":[{"width":1,"height":2},{"width":3,"height":4}]}',{ parseSpecialCharSequences: false })
    cy.get('#aspect-ratio-list').children().should('have.length',2)
    cy.get('#json-error').should('not.exist')
    cy.get('#json-container').type("{ctrl+a}{backspace}")
    cy.get('#json-container').type('{"ratios":[{"width":1,"height":2},{"width":3,"height":4}]',{ parseSpecialCharSequences: false })
    cy.get('#json-error').should('exist')
    cy.get('#aspect-ratio-list').should('not.exist')
  })
})