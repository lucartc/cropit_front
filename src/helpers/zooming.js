import {
  container,
  is_image_ready
} from "./general.js"

const zoom_percentage = 5

function zoom_container() {
  return container()
}

function zoom(cursor_absolute_position, in_out) {
  if (
    is_image_ready()
  ) {
    calculate_zooming(cursor_absolute_position, in_out)
  }
}

function calculate_zooming(cursor_absolute_position, in_out) {
  let resized_dimensions = null

  resized_dimensions = resize_dimensions(cursor_absolute_position, in_out)

  const style = zoom_container().style
  const new_width = resized_dimensions.image_width
  const new_height = resized_dimensions.image_height
  const new_distance_top = resized_dimensions.top
  const new_distance_left = resized_dimensions.left
  style.backgroundSize = `${new_width}px ${new_height}px`
  style.backgroundPosition = `${new_distance_left}px ${new_distance_top}px`
}

function resize_dimensions(cursor_absolute_position, in_out) {
  const container_box = zoom_container().getBoundingClientRect()

  const image_current_size = {
    x: parseFloat(
      zoom_container().style.backgroundSize.split("px", 2).shift().trim()
    ),
    y: parseFloat(
      zoom_container().style.backgroundSize.split("px", 2).pop().trim()
    ),
  }

  const image_current_position = {
    x: parseFloat(
      zoom_container().style.backgroundPosition.split("px", 2).shift().trim()
    ),
    y: parseFloat(
      zoom_container().style.backgroundPosition.split("px", 2).pop().trim()
    ),
  }

  const image_dimensions = {
    image_width: image_current_size.x,
    image_height: image_current_size.y,
    top: image_current_position.y,
    left: image_current_position.x
  }

  image_dimensions.image_width *= scaling_factor(in_out)
  image_dimensions.image_height *= scaling_factor(in_out)

  const image_center = {
    x: image_dimensions.left + image_dimensions.image_width / 2,
    y: image_dimensions.top + image_dimensions.image_height / 2,
  }

  const cursor_relative_position = {
    x: cursor_absolute_position.x - (container_box.left + window.scrollX),
    y: cursor_absolute_position.y - (container_box.top + window.scrollY),
  }

  const new_image_to_cursor_distance = {
    x: (image_center.x - cursor_relative_position.x) * scaling_factor(in_out),
    y: (image_center.y - cursor_relative_position.y) * scaling_factor(in_out),
  }

  const bottom =
    Math.abs(new_image_to_cursor_distance.y) -
    Math.abs(image_dimensions.image_height / 2) +
    Math.abs(container_box.bottom - cursor_absolute_position.y + window.scrollY)
  
  const right =
    Math.abs(new_image_to_cursor_distance.x) -
    Math.abs(image_dimensions.image_width / 2) +
    Math.abs(container_box.right - cursor_absolute_position.x + window.scrollX)

  if (image_is_above_left(new_image_to_cursor_distance)) {
    image_dimensions.top = Math.abs(container_box.height) - 
                     bottom - 
                     Math.abs(image_dimensions.image_height)
    
    image_dimensions.left = Math.abs(container_box.width) -
                      right -
                      Math.abs(image_dimensions.image_width)
  } else if (image_is_above_right(new_image_to_cursor_distance)) {
    image_dimensions.top = Math.abs(container_box.height) -
                     bottom -
                     Math.abs(image_dimensions.image_height)
    
    image_dimensions.left = Math.abs(new_image_to_cursor_distance.x) -
                      Math.abs(image_dimensions.image_width / 2) +
                      Math.abs(cursor_relative_position.x)
  } else if (image_is_below_left(new_image_to_cursor_distance)) {
    image_dimensions.top = Math.abs(new_image_to_cursor_distance.y) -
                     Math.abs(image_dimensions.image_height / 2) +
                     Math.abs(cursor_relative_position.y)
    
    image_dimensions.left = Math.abs(container_box.width) -
                      right -
                      Math.abs(image_dimensions.image_width)
  } else if (image_is_below_right(new_image_to_cursor_distance)) {
    image_dimensions.top = Math.abs(new_image_to_cursor_distance.y) -
                     Math.abs(image_dimensions.image_height / 2) +
                     Math.abs(cursor_relative_position.y)
                     
    image_dimensions.left = Math.abs(new_image_to_cursor_distance.x) -
                      Math.abs(image_dimensions.image_width / 2) +
                      Math.abs(cursor_relative_position.x)
  }

  return image_dimensions
}

function scaling_factor(in_out) {
  return in_out == "in"
    ? Math.sqrt(1 + zoom_percentage / 100)
    : 1 / Math.sqrt(1 + zoom_percentage / 100)
}

function image_is_above_left(distance) {
  return distance.x <= 0 && distance.y <= 0
}

function image_is_above_right(distance) {
  return distance.x > 0 && distance.y <= 0
}

function image_is_below_left(distance) {
  return distance.x <= 0 && distance.y > 0
}

function image_is_below_right(distance) {
  return distance.x > 0 && distance.y > 0
}

export { zoom }
