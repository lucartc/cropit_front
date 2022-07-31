function cursor_is_not_at_screen_origin(cursor_position) {
  const page_x = cursor_position.x;
  const page_y = cursor_position.y;
  const viewport = { x: null, y: null };
  viewport.x = Math.trunc(window.scrollX);
  viewport.y = Math.trunc(window.scrollY);
  return page_x != viewport.x || page_y != viewport.y;
}

function hide_ghost(event) {
  const container = document.createElement("div");
  event.dataTransfer.setDragImage(container, 0, 0);
}

function container() {
  return document.querySelector("#crop-container");
}

function crop_area() {
  return document.querySelector("#crop-area");
}

function container_is_present(){
  return container() != null
}

function crop_area_is_present(){
  return crop_area() != null
}

function is_image_position_in_pixels() {
  const container_computed_style = getComputedStyle(container());
  const position = container_computed_style.backgroundPosition.split("px");
  return position.length > 1;
}

function is_image_size_in_pixels() {
  const container_computed_style = getComputedStyle(container());
  const size = container_computed_style.backgroundSize.split("px");
  return size.length > 1;
}

function is_image_ready(){
  return is_image_size_in_pixels() && is_image_position_in_pixels()
}

async function download_images(cropped_images){
  let sources = new Set()

  cropped_images.forEach((crop) => {
    sources.add(crop.source)
  })

  sources = Array.from(sources)

  await Promise.all(sources
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
                      const response = {};
                      response[source] = file.result.replace(/data:.+;base64,/,'');
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
}

export {
  cursor_is_not_at_screen_origin,
  hide_ghost,
  container,
  crop_area,
  download_images,
  container_is_present,
  crop_area_is_present,
  is_image_ready
};
