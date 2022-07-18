function convert_background_image_dimensions_to_pixels(background_image,container) {
  const container_computed_style = getComputedStyle(container);
  const background_position = container_computed_style.backgroundPosition
  const background_size = container_computed_style.backgroundSize;
  let image_dimensions = null;

  switch (background_size) {
    case "contain":
      image_dimensions =
        calculate_containing_image_dimensions(background_image,container);
      break;
    case "cover":
      image_dimensions = calculate_covering_image_dimensions(background_image,container);
      break;
    default:
    	if(position_in_pixels(container) && size_in_pixels(container)){
    		image_dimensions = {
    			image_width: parseFloat(background_size.split('px',2).shift().trim()),
    			image_height: parseFloat(background_size.split('px',2).pop().trim()),
    			top: parseFloat(background_position.split('px',2).pop().trim()),
    			left: parseFloat(background_position.split('px',2).shift().trim())
    		}
    	}
  }

  const style = container.style;
  const width = image_dimensions.image_width;
  const height = image_dimensions.image_height;
  const distance_top = image_dimensions.top;
  const distance_left = image_dimensions.left;
  style.backgroundSize = `${width}px ${height}px`;
  style.backgroundPosition = `${distance_left}px ${distance_top}px`;

  return {
  	image_width: width,
  	image_height: height,
  	top: distance_top,
  	left: distance_left
  }
}

function calculate_covering_image_dimensions(image,container) {
	const container_box = container.getBoundingClientRect();
	const container_computed_style = getComputedStyle(container)
	const position = container_computed_style.backgroundPosition
	const size = container_computed_style.backgroundSize

	if(position_in_pixels(container) && size_in_pixels(container)){
		return {
			image_height: parseFloat(size.split('px',2).pop().trim()),
			image_width: parseFloat(size.split('px',2).shift().trim()),
			top: parseFloat(position.split('px',2).pop().trim()),
			left: parseFloat(position.split('px',2).shift().trim())
		}
	}else{
	  const container_area = container_box.width * container_box.height;
	  const height_aligned_area =
	    container_box.height ** 2 * image_aspect_ratio(image);
	  let image_height = null;
	  let image_width = null;

	  if (height_aligned_area > container_area) {
	    image_height = container_box.height;
	    image_width = container_box.height * image_aspect_ratio(image);
	  } else {
	    image_width = container_box.width;
	    image_height = container_box.width * (1 / image_aspect_ratio(image));
	  }

	  const top = Math.abs(image_height - container_box.height) / 2;
	  const left = Math.abs(image_width - container_box.width) / 2;

	  return {
	    image_height: image_height,
	    image_width: image_width,
	    top: top,
	    left: left,
	  };
	}
}

function calculate_containing_image_dimensions(image,container) {
	const container_box = container.getBoundingClientRect();
	const container_computed_style = getComputedStyle(container)
	const position = container_computed_style.backgroundPosition
	const size = container_computed_style.backgroundSize

	if(position_in_pixels(container) && size_in_pixels(container)){
		return {
			image_height: parseFloat(size.split('px',2).pop().trim()),
			image_width: parseFloat(size.split('px',2).shift().trim()),
			top: parseFloat(position.split('px',2).pop().trim()),
			left: parseFloat(position.split('px',2).shift().trim())
		}
	}else{
	  const container_area = container_box.width * container_box.height;
	  const height_aligned_area =
	    container_box.height ** 2 * image_aspect_ratio(image);
	  let image_height = null;
	  let image_width = null;

	  if (height_aligned_area < container_area) {
	    image_height = container_box.height;
	    image_width = container_box.height * image_aspect_ratio(image);
	  } else {
	    image_width = container_box.width;
	    image_height = container_box.width * (1 / image_aspect_ratio(image));
	  }

	  const top = Math.abs(image_height - container_box.height) / 2;
	  const left = Math.abs(image_width - container_box.width) / 2;

	  return {
	    image_height: image_height,
	    image_width: image_width,
	    top: top,
	    left: left,
	  };
	}
}

function position_in_pixels(container){
	const container_computed_style = getComputedStyle(container)
	const position = container_computed_style.backgroundPosition.split('px')
	return position.length > 1
}

function size_in_pixels(container){
	const container_computed_style = getComputedStyle(container)
	const size = container_computed_style.backgroundSize.split('px')
	return size.length > 1	
}

function image_aspect_ratio(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return parseFloat(width) / parseFloat(height);
}

export{
	convert_background_image_dimensions_to_pixels
}