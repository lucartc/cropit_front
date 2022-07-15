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
    image_width: rendered_width * scaling_factor(in_out),
    image_height: rendered_height * scaling_factor(in_out),
    left: left * scaling_factor(in_out),
    top: top * scaling_factor(in_out),
  };
}

function calculate_covering_image_position(image, container,in_out) {
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
    image_height: image_height * scaling_factor(in_out),
    image_width: image_width * scaling_factor(in_out),
    top: top * scaling_factor(in_out),
    left: left * scaling_factor(in_out)
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

// For all that matters, the percentage distances here are being calculated in a way
// that may be different from the documentation for background-position. Here, the use
// of percentages is a mere abstraction to allow us to convert from and to pixels in a easier way
// than trying to break down and understand the rather strange positioning behaviour that
// bakcground-position presents us when percentages are used.

// A percentage here is calculated in respect to the container dimensions. A 60% left
// distance means that the object width is 60% of the container's width away from
// its left border. A left distance of -60% means that the object is away from
// the container's left border by a distance in pixels equivalent to 60% of its
// width. The minus sign simply means that the bounding box left distance of the
// object is less than the bounding box left distance of the container, instead
// of being grater, in which case we would have 60% instead of -60%.

function center_in_pixels(image_center,container){
	const container_box = container.getBoundingClientRect();

  if (image_center.x.split("%").length > 1) {
    const percentage = parseFloat(image_center.x.split("%").shift());
    image_center.x = (percentage * container_box.width) / 100;
  } else {
    image_center.x = parseFloat(image_center.x.split("px").shift());
  }

  if (image_center.y.split("%").length > 1) {
    const percentage = parseFloat(image_center.y.split("%").shift());
    image_center.y = (percentage * container_box.height) / 100;
  } else {
    image_center.y = parseFloat(image_center.y.split("px").shift());
  }

  return image_center
}

function zoom(image, container,in_out) {
  const crop_window = document.querySelector("#crop-window");
  const container_box = container.getBoundingClientRect();
  const crop_box = crop_window.getBoundingClientRect();
  const container_computed_style = getComputedStyle(container);
  
  let image_center = {
  	x: container_computed_style.backgroundPosition.split(" ").shift(),
  	y: container_computed_style.backgroundPosition.split(" ").pop()
  }

  let crop_center = {
    x: crop_box.left - container_box.left + crop_box.width/2,
    y: crop_box.top - container_box.top + crop_box.height/2,
  };
  
  image_center = center_in_pixels(image_center,container)

  let image_to_crop_distance = {
  	x: image_center.x - crop_center.x,
  	y: image_center.y - crop_center.y
  }

  let new_image_to_crop_distance = {
    x: image_to_crop_distance.x * scaling_factor(in_out),
    y: image_to_crop_distance.y * scaling_factor(in_out),
  }

  // const crop_center_el = document.createElement("div");
  // crop_center_el.style.width = "10px";
  // crop_center_el.style.aspectRatio = "1";
  // crop_center_el.style.borderRadius = "50%";
  // crop_center_el.style.backgroundColor = "#ff3355";
  // crop_center_el.style.position = "absolute";
  // crop_center_el.style.top = `${crop_center.y - 5}px`;
  // crop_center_el.style.left = `${crop_center.x - 5}px`;

  // container.appendChild(crop_center_el);

  let background_dimensions = null;

  if(image_current_size.value == null){
  	image_current_size.value = container_computed_style.backgroundSize
  }

  const background_size = image_current_size.value;

  switch(background_size){
    case "contain":
      background_dimensions = calculate_containing_image_position(image,container, in_out);
      break;
    case "cover":
      background_dimensions = calculate_covering_image_position(image,container, in_out);
      break;
    case "auto":
      background_dimensions = calculate_auto_image_position(image, container, in_out);
      break;
    default:
    	background_dimensions = {
		    image_height: background_size.y * scaling_factor(in_out),
		    image_width: background_size.x * scaling_factor(in_out),
		    top: null,
		    left: null
    	}

		  image_to_crop_distance = {
		  	x: image_center.x + background_dimensions.image_width/2 - crop_center.x,
		  	y: image_center.y + background_dimensions.image_height/2 - crop_center.y
		  }

		  new_image_to_crop_distance = {
		    x: image_to_crop_distance.x * scaling_factor(in_out),
		    y: image_to_crop_distance.y * scaling_factor(in_out),
		  }

    	let bottom = Math.abs(new_image_to_crop_distance.y) - Math.abs(background_dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(container_box.bottom - crop_box.bottom)
    	let right = Math.abs(new_image_to_crop_distance.x) - Math.abs(background_dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(container_box.right - crop_box.right)

			if(image_is_above_left(image_to_crop_distance)){
				background_dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(background_dimensions.image_height)
				background_dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(background_dimensions.image_width)
			}else if(image_is_above_right(image_to_crop_distance)){
				background_dimensions.top = Math.abs(container_box.height) - Math.abs(bottom) - Math.abs(background_dimensions.image_height)
				background_dimensions.left = Math.abs(new_image_to_crop_distance.x) - Math.abs(background_dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(crop_box.left - container_box.left)
			}else if(image_is_below_left(image_to_crop_distance)){
				background_dimensions.top = Math.abs(new_image_to_crop_distance.y) - Math.abs(background_dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(crop_box.top - container_box.top)
				background_dimensions.left = Math.abs(container_box.width) - Math.abs(right) - Math.abs(background_dimensions.image_width)
			}else if(image_is_below_right(image_to_crop_distance)){
				background_dimensions.top = Math.abs(new_image_to_crop_distance.y) - Math.abs(background_dimensions.image_height/2) + Math.abs(crop_box.height/2) + Math.abs(crop_box.top - container_box.top)
				background_dimensions.left = Math.abs(new_image_to_crop_distance.x) - Math.abs(background_dimensions.image_width/2) + Math.abs(crop_box.width/2) + Math.abs(crop_box.left - container_box.left)
			}

    	break;
  }

	image_current_size.value = {
		x: background_dimensions.image_width,
		y: background_dimensions.image_height
	}

	image_current_position.value = {
		x: background_dimensions.left,
		y: background_dimensions.top
	}

  container.style.backgroundSize = `${image_current_size.value.x}px ${image_current_size.value.y}px`;
  container.style.backgroundPosition = `${image_current_position.value.x}px ${image_current_position.value.y}px`;

  // const image_center_el = document.createElement("div");
  // image_center_el.style.width = "10px";
  // image_center_el.style.aspectRatio = "1";
  // image_center_el.style.borderRadius = "50%";
  // image_center_el.style.backgroundColor = "#55ff55";
  // image_center_el.style.position = "absolute";
  // image_center_el.style.top = `${image_current_position.value.y - 5}px`;
  // image_center_el.style.left = `${image_current_position.value.x - 5}px`;

  // container.appendChild(image_center_el);
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
