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

  it('should drag crop area around',() => {
    let crop_area_center = null

    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#zoom-in-button').click()
    cy.get('#home-button').click()
    cy.get('#app').then(el => {
      const container = el[0].querySelector('#crop-container')
      const crop = el[0].querySelector('#crop-area')
      const container_dimensions = container.getBoundingClientRect()
      const crop_area_dimensions = crop.getBoundingClientRect()
      crop_area_center = {
        x: crop_area_dimensions.left + crop_area_dimensions.width/2,
        y: crop_area_dimensions.top + crop_area_dimensions.height/2
      }
    })
    cy.get('#crop-container').then(el => {
      const container_dimensions = el[0].getBoundingClientRect()
      cy.get('#crop-area').then(el => {
        const crop_area_dimensions = el[0].getBoundingClientRect()
      })
    })
    .then(data => {
      cy.get('#crop-area')
      .trigger('mousedown')
      .trigger('dragstart')
      .trigger('dragover',{pageX: crop_area_center.x, pageY: crop_area_center.y})
      .trigger('dragover',{pageX: crop_area_center.x + 150, pageY: crop_area_center.y + 150})
    })
    .then(data => {
      cy.get('#crop-container').then(el => {
        const container_dimensions = el[0].getBoundingClientRect()
        cy.get('#crop-area').then(el => {
          const crop_area_dimensions = el[0].getBoundingClientRect()
          expect(Math.round(crop_area_center.x)).to.be.lessThan(Math.round(crop_area_dimensions.left + crop_area_dimensions.width/2))
          expect(Math.round(crop_area_center.y)).to.be.lessThan(Math.round(crop_area_dimensions.top + crop_area_dimensions.height/2))
        })
      })
    })
  })

  it('should drag image around',() => {
    let image_center = null

    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#zoom-in-button').click()
    cy.get('#home-button').click()
    cy.get('#crop-container').then(el => {
      const image_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      const image_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
      const image_position_x = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).shift().trim())
      const image_position_y = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).pop().trim())
      image_center = {
        x: image_position_x + image_width/2,
        y: image_position_y + image_height/2
      }
    })
    .then(data => {
      cy.get('#crop-container')
      .trigger('mousedown',{which: 1,pageX: image_center.x, pageY: image_center.y})
      .trigger('dragover',{pageX: image_center.x, pageY: image_center.y})
      .trigger('dragover',{pageX: image_center.x + 150, pageY: image_center.y + 150})
    })
    .then(data => {
      cy.get('#crop-container').then(el => {
        const image_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
        const image_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
        const image_position_x = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).shift().trim())
        const image_position_y = parseFloat(getComputedStyle(el[0]).backgroundPosition.split('px',2).pop().trim())
        expect(Math.round(image_center.x)).to.be.lessThan(Math.round(image_position_x + image_width/2))
        expect(Math.round(image_center.y)).to.be.lessThan(Math.round(image_position_y + image_height/2))
      })
    })
  })
  
  it('should zoom image when mouse is scrolled',() => {
    const width = null
    const height = null
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#zoom-in-button').click()
    cy.get('#crop-container').then(el => {
      width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
      height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
    })
    .then(data => cy.get('#crop-container').trigger('wheel',{deltaY: -60}))
    .then(data => {
      cy.get('#crop-container').then(el => {
        const new_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
        const new_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
        expect(new_width).to.be.greaterThan(width)
        expect(new_height).to.be.greaterThan(height)
        width = new_width
        height = new_height
      })
    })
    .then(data => cy.get('#crop-container').trigger('wheel',{deltaY: 60}))
    .then(data => {
      cy.get('#crop-container').then(el => {
        const new_width = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).shift().trim())
        const new_height = parseFloat(getComputedStyle(el[0]).backgroundSize.split('px',2).pop().trim())
        expect(new_width).to.be.lessThan(width)
        expect(new_height).to.be.lessThan(height)
      })
    })
  })

  it('should create crop image when crop button is clicked',() => {
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get('#carroussel-container').children().should('have.length',0)
    cy.get('#crop').click()
    cy.get('#carroussel-container').children().should('have.length',1)
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
    cy.visit('/app')
    cy.get('#import-image-input').selectFile('cypress/fixtures/flower.jpeg',{force: true})
    cy.get("#crop").click()
    cy.get('#wait-modal').should('not.be.visible')
    cy.get('#download-images').click({force: true})
    cy.get('#wait-modal').should('be.visible')
    cy.readFile('cypress/downloads/images.zip',{timeout: 30000}).should('exist')
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