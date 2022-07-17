import { ref, computed, watch } from "vue";

const image_current_position = ref(null)
const image_current_size = ref(null)
const zoom_percentage = 5

function zoom(cursor_absolute_position,container,in_out) {
	const background_image = new Image()
  const container_computed_style = getComputedStyle(container)

  background_image.src = container_computed_style.backgroundImage
  											 .replace('url("','')
  											 .replace('")','')

  background_image.addEventListener('load',(event) => {
  	if(image_current_size.value == null){
  		convert_background_image_dimensions_to_pixels(background_image,container,in_out)
  	}
  	calculate_zooming(cursor_absolute_position,container,in_out)
  })
}

function convert_background_image_dimensions_to_pixels(background_image,container,in_out){
	const container_computed_style = getComputedStyle(container)
	let background_size = container_computed_style.backgroundSize
	let current_dimensions = null

	switch(background_size){
    case "contain":
      current_dimensions = calculate_containing_image_position(background_image,container,in_out)
      break;
    case "cover":
      current_dimensions = calculate_covering_image_position(background_image,container,in_out)
      break;
	}

	image_current_size.value = {x: current_dimensions.image_width, y: current_dimensions.image_height}
	image_current_position.value = {x: current_dimensions.left, y: current_dimensions.top}
	container.style.backgroundSize = `${current_dimensions.image_width}px ${current_dimensions.image_height}px`
	container.style.backgroundPosition = `${current_dimensions.left}px ${current_dimensions.top}px`
}

function calculate_centered_image_position(image, container,in_out) {
  const container_box = container.getBoundingClientRect();
  const image_width = image.naturalWidth;
  const image_height = image.naturalHeight;

  let rendered_width = null;
  let rendered_height = null;

  if (image_width >= image_height) {
    rendered_width = container_box.width;
    rendered_height = container_box.width * (1 / image_aspect_ratio(image));
  } else {
    rendered_height = container_box.height;
    rendered_width = container_box.height * image_aspect_ratio(image);
  }

  let left = null;
  let top = null;

  if (image_width >= image_height) {
    if (container_box.width >= container_box.height) {
      left = (container_box.width - image_width) / 2;
    } else {
      top = (container_box.height - image_height) / 2;
    }
  } else {
    if (container_box.width >= container_box.height) {
      left = (container_box.width - image_width) / 2;
    } else {
      top = (container_box.height - image_height) / 2;
    }
  }

  return {
    image_width: rendered_width,
    image_height: rendered_height,
    left: left,
    top: top
  };
}

function calculate_covering_image_position(image,container,in_out) {
  const container_box = container.getBoundingClientRect();
  const container_area = container_box.width.container_box.height;
  const width_aligned_area = container_box.width ** 2 * (1 / image_aspect_ratio(image));
  const height_aligned_area = container_box.height ** 2 * image_aspect_ratio(image);
  let image_height = null;
  let image_width = null;

  if (height_aligned_area > container_area) {
    image_height = container_box.height;
    image_width = container_box.height * image_aspect_ratio(image);
  } else {
    image_width = container_box.width;
    image_height = container_box.width * (1 / image_aspect_ratio(image));
  }

  const left = Math.abs(image_width - container_box.width) / 2;
  const top = Math.abs(image_height - container_box.height) / 2;

  return {
    image_height: image_height,
    image_width: image_width,
    top: top,
    left: left
  };
}

function calculate_containing_image_position(image,container,in_out) {
  const container_box = container.getBoundingClientRect();
  const container_computed_style = getComputedStyle(container);
  const position = container_computed_style.backgroundPosition;
  const distance_x_percentage = parseFloat(position.split("%", 2).shift());
  const distance_y_percentage = parseFloat(position.split("%", 2).pop().trim());
  let image_width = null;
  let image_height = null;
  const distance_x_pixels = (container_box.width * distance_x_percentage)/100;
  const distance_y_pixels = (container_box.height * distance_y_percentage)/100;

  if (image.naturalWidth > image.naturalHeight) {
    image_width = container_box.width;
    image_height = image_width * (1/image_aspect_ratio(image));
  } else {
    image_height = container_box.height;
    image_width = image_height * image_aspect_ratio(image);
  }

  const top = distance_y_pixels - image_height/2;
  const left = distance_x_pixels - image_width/2;

  return {
    image_height: image_height,
    image_width: image_width,
    top: top,
    left: left
  };
}

function image_aspect_ratio(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return parseFloat(width) / parseFloat(height);
}

function calculate_zooming(cursor_absolute_position,container,in_out){
  const container_computed_style = getComputedStyle(container)
  let resized_dimensions = null
  let background_size = null

  resized_dimensions = resize_dimensions(cursor_absolute_position,container,in_out)

	image_current_size.value = {
		x: resized_dimensions.image_width,
		y: resized_dimensions.image_height
	}

	image_current_position.value = {
		x: resized_dimensions.left,
		y: resized_dimensions.top
	}

  container.style.backgroundSize = `${image_current_size.value.x}px ${image_current_size.value.y}px`;
  container.style.backgroundPosition = `${image_current_position.value.x}px ${image_current_position.value.y}px`;
}

function resize_dimensions(cursor_absolute_position,container,in_out){
	let container_box = container.getBoundingClientRect()
	let dimensions = {
		image_width: image_current_size.value.x,
		image_height: image_current_size.value.y,
		top: image_current_position.value.y,
		left: image_current_position.value.x
	}

	dimensions.image_width *= scaling_factor(in_out)
  dimensions.image_height *= scaling_factor(in_out)

  let image_center = {
  	x: dimensions.left + dimensions.image_width/2,
  	y: dimensions.top + dimensions.image_height/2
  }

  let cursor_relative_position = {
    x: cursor_absolute_position.x - container_box.left,
    y: cursor_absolute_position.y - container_box.top
  };

  let new_image_to_cursor_distance = {
    x: (image_center.x - cursor_relative_position.x) * scaling_factor(in_out),
    y: (image_center.y - cursor_relative_position.y) * scaling_factor(in_out)
  }

	let bottom = Math.abs(new_image_to_cursor_distance.y) - Math.abs(dimensions.image_height/2) + Math.abs(container_box.bottom - cursor_absolute_position.y)
	let right = Math.abs(new_image_to_cursor_distance.x) - Math.abs(dimensions.image_width/2) + Math.abs(container_box.right - cursor_absolute_position.x)

	if(image_is_above_left(new_image_to_cursor_distance)){
		dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(dimensions.image_height)
		dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(dimensions.image_width)
	}else if(image_is_above_right(new_image_to_cursor_distance)){
		dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(dimensions.image_height)
		dimensions.left = Math.abs(new_image_to_cursor_distance.x) - Math.abs(dimensions.image_width/2) + Math.abs(cursor_relative_position.x)
	}else if(image_is_below_left(new_image_to_cursor_distance)){
		dimensions.top = Math.abs(new_image_to_cursor_distance.y) - Math.abs(dimensions.image_height/2) + Math.abs(cursor_relative_position.y)
		dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(dimensions.image_width)
	}else if(image_is_below_right(new_image_to_cursor_distance)){
		dimensions.top = Math.abs(new_image_to_cursor_distance.y) - Math.abs(dimensions.image_height/2) + Math.abs(cursor_relative_position.y)
		dimensions.left = Math.abs(new_image_to_cursor_distance.x) - Math.abs(dimensions.image_width/2) + Math.abs(cursor_relative_position.x)
	}

	return dimensions
}

function scaling_factor(in_out){
	return in_out == 'in' ? Math.sqrt(1 + zoom_percentage/100) : 1/Math.sqrt(1 + zoom_percentage/100)
}

function image_is_left(distance){
	return distance.x < 0 && distance.y == 0;
}

function image_is_right(distance){
	return distance.x > 0 && distance.y == 0;
}

function image_is_top(distance){
	return distance.x == 0 && distance.y < 0;
}

function image_is_bottom(distance){
	return distance.x == 0 && distance.y < 0;
}

function image_is_above_left(distance) {
  return distance.x <= 0 && distance.y <= 0;
}

function image_is_above_right(distance) {
  return distance.x > 0 && distance.y <= 0;
}

function image_is_below_left(distance) {
  return distance.x <= 0 && distance.y > 0;
}

function image_is_below_right(distance) {
  return distance.x > 0 && distance.y > 0;
}

export {
  zoom
};
