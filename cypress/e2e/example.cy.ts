// https://docs.cypress.io/api/introduction/api.html

describe('Test suit',() => {
  it('Receive image and shows it at current-image div',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#import-image').should('not.exist')
  })

  it('Should update crop-area when a new aspect-ratio is created',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#add-aspect-ratio').click()
    cy.get('input[name=width]').type('{backspace}3')
    cy.get('input[name=height]').type('{backspace}4')
    cy.get('#confirm-button').click()
    cy.get('#crop-area').should('have.css','aspect-ratio','3 / 4')
  })

  it('Should move cropped_images to right when clicking in move right button',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    for(let i = 0; i < 20; i++){
      cy.get('#crop').click()
    }

    let initial_position = null

    cy.get('#cropped-images-carroussel').then((el) => {
      const dimensions = el[0].getBoundingClientRect()
      initial_position = dimensions.x
    })
    .then(async function(data){await cy.get("#move-right").click()})
    .then(data => cy.get('#cropped-images-carroussel').then((el) => {
      const new_dimensions = el[0].getBoundingClientRect()
      const new_position = new_dimensions.x
      expect(initial_position).to.be.greaterThan(new_position)
    }))
  })

  it('Should move cropped_images to left when clicking in move left button',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    for(let i = 0; i < 20; i++){
      cy.get('#crop').click()
    }

    let initial_position = null

    cy.get('#cropped-images-carroussel')
    .then(async function(data){await cy.get("#move-right").click()})
    .then(async function(data){return await cy.get('#cropped-images-carroussel')})
    .then(data => {
      const dimensions = data[0].getBoundingClientRect()
      initial_position = dimensions.x
    })
    .then(async function(data){await cy.get('#move-left').click()})
    .then(data => cy.get("#cropped-images-carroussel").then(el => {
      const new_dimensions = el[0].getBoundingClientRect()
      const new_position = new_dimensions.x
      expect(initial_position).to.be.lessThan(new_position)
    }))
  })

  it('should drag crop area around',() => {
    expect(true).to.be(false)
  })
  it('should drag image around',() => {
    expect(true).to.be(false)
  })
  
  it('should create crop image when crop button is clicked',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#cropped-images-carroussel').children().should('have.length',0)
    cy.get('#crop').click()
    cy.get('#cropped-images-carroussel').children().should('have.length',1)
  })
  
  it('should show modal when download button is clicked if there are cropped images available',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#crop').click()
    cy.get('#wait-modal').should('not.be.visible')
    cy.get('#download-images').click()
    cy.get('#wait-modal').should('be.visible')
  })

  it('should download cropped images when download button is clicked if there are cropped images availale',() => {
    expect(false).to.be(true)
  })

  it('should not downlod cropped images when download button is clicked if there are no available cropped images',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#wait-modal').should('not.be.visible')
    cy.get('#download-images').click({force: true})
    cy.get('#wait-modal').should('not.be.visible')
  })

  it('should clear image when clear button is clicked',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})

    cy.get('#clear').click()

    cy.get("#crop-container").then(el => {
      const current_background_image = el[0].style.backgroundImage
      expect(current_background_image).to.equal('url("null")')
    })
  })

  it('should zoom image in when zoom-in button is clicked',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})

    const initial_background_size = {width: null, height: null}
    
    cy.get('#zoom-in-button').click()

    cy.get("#crop-container").then(el => {
      initial_background_size.width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      initial_background_size.height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      console.log(getComputedStyle(el[0]).backgroundSize)
    })

    cy.get('#zoom-in-button').click()

    cy.get("#crop-container").then(el => {
      const current_background_size_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      const current_background_size_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      expect(current_background_size_width).to.be.greaterThan(initial_background_size.width)
      expect(current_background_size_height).to.be.greaterThan(initial_background_size.height)
    })
  })

  it('should zoom image out when zoom-out button is clicked',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})

    const initial_background_size = {width: null, height: null}
    
    cy.get('#zoom-out-button').click()

    cy.get("#crop-container").then(el => {
      initial_background_size.width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      initial_background_size.height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      console.log(getComputedStyle(el[0]).backgroundSize)
    })

    cy.get('#zoom-out-button').click()

    cy.get("#crop-container").then(el => {
      const current_background_size_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      const current_background_size_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      expect(current_background_size_width).to.be.lessThan(initial_background_size.width)
      expect(current_background_size_height).to.be.lessThan(initial_background_size.height)
    })
  })

  it('should center image when center button is clicked',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})

    const container_center = null

    cy.get("#crop-container").then(el => {
      const dimensions = el[0].getBoundingClientRect()
      container_center = {x: dimensions.width/2, y: dimensions.height/2}
    })
    
    for(let i = 0; i < 20; i++){
      cy.get('#zoom-in-button').click()
    }

    cy.get("#crop-container").then(el => {
      const width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      const height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      const position_x = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).shift().trim())
      const position_y = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).pop().trim())
      expect(Math.round(container_center.x)).to.not.equal(Math.round(position_x+width/2))
      expect(Math.round(container_center.y)).to.not.equal(Math.round(position_y+height/2))
    })

    cy.get('#home-button').click()

    cy.get("#crop-container").then(el => {
      const current_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      const current_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      const current_position_x = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).shift().trim())
      const current_position_y = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).pop().trim())
      expect(Math.round(container_center.x)).to.equal(Math.round(current_position_x+(current_width/2)))
      expect(Math.round(container_center.y)).to.equal(Math.round(current_position_y+(current_height/2)))
    })
  })
})