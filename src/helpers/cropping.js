import {
  container,
  crop_area,
  is_image_ready
} from "./general.js"

function crop_container() {
  return container()
}

function crop() {
  if (
    is_image_ready()
  ) {
    const container_box = crop_container().getBoundingClientRect()
    const crop_box = crop_area().getBoundingClientRect()
    const image_position = getComputedStyle(
      crop_container()
    ).backgroundPosition
    const image_size = getComputedStyle(crop_container()).backgroundSize
    const image_source = getComputedStyle(crop_container()).backgroundImage

    const new_image_position = {
      x:
        parseFloat(image_position.split("px", 2).shift().trim()) -
        (crop_box.left - container_box.left),
      y:
        parseFloat(image_position.split("px", 2).pop().trim()) -
        (crop_box.top - container_box.top),
    }

    return {
      width: parseFloat(image_size.split("px", 2).shift().trim()),
      height: parseFloat(image_size.split("px", 2).pop().trim()),
      top: new_image_position.y,
      left: new_image_position.x,
      crop_window_width: crop_box.width,
      crop_window_height: crop_box.height,
      source: image_source.replace('url("', "").replace('")', ""),
    }
  }
}

async function download_cropped_images(cropped_images){
  let sources = new Set()

  cropped_images.forEach((crop) => {
    sources.add(crop.source)
  })

  sources = Array.from(sources)

  const result = await Promise.all(sources
    .map(source => fetch(source)
                   .then(data => data.blob())
                   .then(async function(data){
                      const file = new FileReader()
                      await new Promise((res,err) => {
                        file.onload = res
                        file.onerror = err
                        file.readAsDataURL(data)
                      })
                      return file
                   })
                   .then(file => {
                      const response = {}
                      response[source] = file.result.replace(/data:.+;base64,/,'')
                      return response
                    })
    ))
  .then(data => {
    data = data.reduce((sum,item) => {
      for(let property in item){
        sum[property] = item[property]
        return sum
      }
    })

    const message = JSON.stringify({
      sources: data,
      cropped_images: cropped_images 
    })

    fetch('http://api.cropit.jlucartc.tech/download',{
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: message
    })
    .then(data => data.blob())
    .then(data => URL.createObjectURL(data))
    .then(url => {
      let download_link = document.createElement('a')
      download_link.href = url
      download_link.download = 'images.zip'
      download_link.click()
    })
  })

  return result
}

export { crop, download_cropped_images }
