import { ref, computed, watch } from "vue";

const image_current_position = ref(null)
const image_current_size = ref(null)
const zoom_percentage = 5

function scaling_factor(in_out){
	return in_out == 'in' ? Math.sqrt(1 + zoom_percentage/100) : 1/Math.sqrt(1 + zoom_percentage/100)
}

function image_aspect_ratio(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return parseFloat(width) / parseFloat(height);
}

// Calculates image position when it's centered inside its container.
function calculate_centered_image_position(image, container,in_out) {
  const container_box = container.getBoundingClientRect();
  const image_width = image.naturalWidth;
  const image_height = image.naturalHeight;

  // Starts calculating image rendered width and height.

  let rendered_width = null;
  let rendered_height = null;

  if (image_width >= image_height) {
    rendered_width = container_box.width;
    rendered_height = container_box.width * (1 / image_aspect_ratio(image));
  } else {
    rendered_height = container_box.height;
    rendered_width = container_box.height * image_aspect_ratio(image);
  }

  // Now proceeds to calculate the margins between the image and the container,
  // if there are any.

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

  // Checks which resizing will make the image cover the container completely,
  // with the smallest size possible.

  if (height_aligned_area > container_area) {
    image_height = container_box.height;
    image_width = container_box.height * image_aspect_ratio(image);
  } else {
    image_width = container_box.width;
    image_height = container_box.width * (1 / image_aspect_ratio(image));
  }

  // calculates the margin necessary so that the image will be vertically
  // or horizontally alligned with the container.

  const left = Math.abs(image_width - container_box.width) / 2;
  const top = Math.abs(image_height - container_box.height) / 2;

  return {
    image_height: image_height,
    image_width: image_width,
    top: top,
    left: left
  };
}

// Scales the image as large as possible within its container without
// cropping or stretching the image.
function calculate_containing_image_position(image, container,in_out) {
  const container_box = container.getBoundingClientRect();
  const container_computed_style = getComputedStyle(container);
  const position = container_computed_style.backgroundPosition;
  const distance_x_percentage = parseFloat(position.split("%", 2).shift());
  const distance_y_percentage = parseFloat(position.split("%", 2).pop().trim());
  let image_width = null;
  let image_height = null;
  const distance_x_pixels = (container_box.width * distance_x_percentage) / 100;
  const distance_y_pixels =
    (container_box.height * distance_y_percentage) / 100;

  if (image.naturalWidth > image.naturalHeight) {
    image_width = container_box.width;
    image_height = image_width * (1 / image_aspect_ratio(image));
  } else {
    image_height = container_box.height;
    image_width = image_height * image_aspect_ratio(image);
  }

  const top = distance_y_pixels - image_height / 2;
  const left = distance_x_pixels - image_width / 2;

  return {
    image_height: image_height * scaling_factor(in_out),
    image_width: image_width * scaling_factor(in_out),
    top: top * scaling_factor(in_out),
    left: left * scaling_factor(in_out)
  };
}

function center_in_pixels(image_center,container,dimensions){
	const container_box = container.getBoundingClientRect();

  if (image_center.x.split("%").length > 1) {
    const percentage = parseFloat(image_center.x.split("%").shift());
    image_center.x = (percentage * container_box.width) / 100;
  } else {
    image_center.x = parseFloat(image_center.x.split("px").shift())  + dimensions.image_width/2;
  }

  if (image_center.y.split("%").length > 1) {
    const percentage = parseFloat(image_center.y.split("%").shift());
    image_center.y = (percentage * container_box.height) / 100;
  } else {
    image_center.y = parseFloat(image_center.y.split("px").shift()) + dimensions.image_height/2;
  }

  return image_center
}

function image_current_dimensions(crop,container){
	let crop_box = crop.getBoundingClientRect()
	let container_box = container.getBoundingClientRect()
	let container_computed_style = getComputedStyle(container)

	let background_dimensions = {
    image_height: image_current_size.value.y,
    image_width: image_current_size.value.x,
    top: image_current_position.value.y + image_current_size.value.y/2,
    left: image_current_position.value.x + image_current_size.value.x/2
	}

  let crop_center = {
    x: crop_box.left - container_box.left + crop_box.width/2,
    y: crop_box.top - container_box.top + crop_box.height/2,
  };

  let image_center = {
  	x: container_computed_style.backgroundPosition.split(" ").shift(),
  	y: container_computed_style.backgroundPosition.split(" ").pop()
  }

	image_center = center_in_pixels(image_center,container,background_dimensions)

  let image_to_crop_distance = {
  	x: image_center.x - crop_center.x,
  	y: image_center.y - crop_center.y
  }

	let bottom = Math.abs(image_to_crop_distance.y) - Math.abs(background_dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(container_box.bottom - crop_box.bottom)
	let right = Math.abs(image_to_crop_distance.x) - Math.abs(background_dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(container_box.right - crop_box.right)

	if(image_is_above_left(image_to_crop_distance)){
		background_dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(background_dimensions.image_height)
		background_dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(background_dimensions.image_width)
	}else if(image_is_above_right(image_to_crop_distance)){
		background_dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(background_dimensions.image_height)
		background_dimensions.left = Math.abs(image_to_crop_distance.x) - Math.abs(background_dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(crop_box.left - container_box.left)
	}else if(image_is_below_left(image_to_crop_distance)){
		background_dimensions.top = Math.abs(image_to_crop_distance.y) - Math.abs(background_dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(crop_box.top - container_box.top)
		background_dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(background_dimensions.image_width)
	}else if(image_is_below_right(image_to_crop_distance)){
		background_dimensions.top = Math.abs(image_to_crop_distance.y) - Math.abs(background_dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(crop_box.top - container_box.top)
		background_dimensions.left = Math.abs(image_to_crop_distance.x) - Math.abs(background_dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(crop_box.left - container_box.left)
	}

	return background_dimensions
}

function resize_dimensions(dimensions,crop,container,in_out){
	let crop_box = crop.getBoundingClientRect()
	let container_box = container.getBoundingClientRect()

  let image_center = {
  	x: dimensions.left + dimensions.image_width/2,
  	y: dimensions.top + dimensions.image_height/2
  }

  let crop_center = {
    x: crop_box.left - container_box.left + crop_box.width/2,
    y: crop_box.top - container_box.top + crop_box.height/2,
  };

  let image_to_crop_distance = {
  	x: image_center.x - crop_center.x,
  	y: image_center.y - crop_center.y
  }

  let new_image_to_crop_distance = {
    x: image_to_crop_distance.x * scaling_factor(in_out),
    y: image_to_crop_distance.y * scaling_factor(in_out),
  }

	let bottom = Math.abs(new_image_to_crop_distance.y) - Math.abs(dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(container_box.bottom - crop_box.bottom)
	let right = Math.abs(new_image_to_crop_distance.x) - Math.abs(dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(container_box.right - crop_box.right)

	if(image_is_above_left(new_image_to_crop_distance)){
		dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(dimensions.image_height)
		dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(dimensions.image_width)
	}else if(image_is_above_right(new_image_to_crop_distance)){
		dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(dimensions.image_height)
		dimensions.left = Math.abs(new_image_to_crop_distance.x) - Math.abs(dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(crop_box.left - container_box.left)
	}else if(image_is_below_left(new_image_to_crop_distance)){
		dimensions.top = Math.abs(new_image_to_crop_distance.y) - Math.abs(dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(crop_box.top - container_box.top)
		dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(dimensions.image_width)
	}else if(image_is_below_right(new_image_to_crop_distance)){
		dimensions.top = Math.abs(new_image_to_crop_distance.y) - Math.abs(dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(crop_box.top - container_box.top)
		dimensions.left = Math.abs(new_image_to_crop_distance.x) - Math.abs(dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(crop_box.left - container_box.left)
	}

	return dimensions
}

function zoom(crop,container,in_out) {
	const background_image = new Image()
  const container_computed_style = getComputedStyle(container)
  let current_dimensions = null
  let resized_dimensions = null
  let background_size = null
  
  background_image.src = container_computed_style.backgroundImage
  						.replace('url("','')
  						.replace('")','')

  background_image.addEventListener('load',() => {
	  if(image_current_size.value == null){
	  	background_size = container_computed_style.backgroundSize
	  }else{
	  	background_size = image_current_size.value
	  }

	  switch(background_size){
	    case "contain":
	      current_dimensions = calculate_containing_image_position(background_image,container,in_out)
	      break;
	    case "cover":
	      current_dimensions = calculate_covering_image_position(background_image,container,in_out)
	      break;
	    default:
	      current_dimensions = image_current_dimensions(crop,container)
	  }

	  resized_dimensions = resize_dimensions(current_dimensions,crop,container,in_out)

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
  })
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
  calculate_centered_image_position,
  calculate_covering_image_position,
  calculate_containing_image_position,
  zoom
};
