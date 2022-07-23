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

function opacity_top() {
  return document.querySelector("#opacity-top");
}
function opacity_right() {
  return document.querySelector("#opacity-right");
}
function opacity_bottom() {
  return document.querySelector("#opacity-bottom");
}
function opacity_left() {
  return document.querySelector("#opacity-left");
}

function background_image_position_in_pixels() {
  const container_computed_style = getComputedStyle(container());
  const position = container_computed_style.backgroundPosition.split("px");
  return position.length > 1;
}

function background_image_size_in_pixels() {
  const container_computed_style = getComputedStyle(container());
  const size = container_computed_style.backgroundSize.split("px");
  return size.length > 1;
}

function download_images(cropped_images){

  let sources = new Set()

  cropped_images.forEach((crop) => {
    sources.add(crop.source)
  })

  sources = Array.from(sources)

  sources.forEach(source => {
    let source_file = new FileReader()
    source_file.addEventListener('loadend',() => {
      let crops = cropped_images.filter((img) => img.source === source )
      crops = crops.map(crop => {
        return {
          container_width: crop.container_width,
          container_height: crop.container_height,
          image_width: crop.width,
          image_height: crop.height,
          top: crop.top,
          left: crop.left
        }
      })

      const message = JSON.stringify({
        image_content: source_file.result,
        cropped_images: crops
      })

      fetch('http://api.cropit.jlucartc.tech/download',{
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: message
      })
      .then(data => data.blob())
      .then(data => URL.createObjectURL(data))
      .then(data => {
        const download_link = document.createElement('a')
        download_link.href = data
        download_link.download = 'images.zip'
        download_link.click()
      })
    })

    fetch(source)
    .then(data => data.blob())
    .then(data => source_file.readAsDataURL(data))
  })
}

export {
  cursor_is_not_at_screen_origin,
  hide_ghost,
  container,
  crop_area,
  opacity_top,
  opacity_right,
  opacity_bottom,
  opacity_left,
  background_image_size_in_pixels,
  background_image_position_in_pixels,
  download_images
};
