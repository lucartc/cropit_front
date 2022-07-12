function image_aspect_ratio(image){
	let width = element.naturalWidth
	let height = element.naturalHeight
	return parseFloat(width) / parseFloat(height)
}

// Calculates image position when it's centered inside its container.

function calculate_centered_image_position(image,container){
	let container_box = container.getBoundingClientRect()
	let image_box = image.getBoundingClientRect()
	let image_width = image.naturalWidth
	let image_height = image.naturalHeight
	
	// Starts calculating image rendered width and height.

	let rendered_width = null
	let rendered_height = null

	if(image_width >= image_height){
		rendered_width = container_box.width
		rendered_height = container_box.width * (1/image_aspect_ratio(image))
	}else{
		rendered_height = container_box.height
		rendered_width = container_box.height * image_aspect_ratio(image)
	}

	// Now proceeds to calculate the margins between the image and the container,
	// if there are any.

	let margin_left = null
	let margin_right = null
	let margin_top = null
	let margin_bottom = null

	if(image_width >= image_height){
		if(container_box.width >= container_box.height){
			margin_left = (container_box.width - image_width)/2
			margin_right = margin_left
		}else{
			margin_top = (container_box.height - image_height)/2
			margin_bottom = margin_top
		}
	}else{
		if(container_box.width >= container_box.height){
			margin_left = (container_box.width - image_width)/2
			margin_right = margin_left
		}else{
			margin_top = (container_box.height - image_height)/2	
			margin_bottom = margin_top
		}
	}

	return {
		container_width: container_box.width,
		container_height: container_box.height,
		image_width: rendered_width,
		image_height: rendered_height,
		margin_left: margin_left,
		margin_right: margin_right,
		margin_top: margin_top,
		margin_bottom: margin_bottom
	}
}

function calculate_covering_image_position(image,container){
	let container_box = container.getBoundingClientRect()
	let container_area = container_box.width . container_box.height
	let width_aligned_area = (container_box.width ** 2) * (1/image_aspect_ratio(image))
	let height_aligned_area = (container_box.height ** 2) * (image_aspect_ratio(image))
	let image_height = null
	let image_width = null

	// Checks which resizing will make the image cover the container completely,
	// with the smallest size possible.

	if(container_area > width_aligned_area){
		image_height = container_box.height
		image_width = container_box.height * (image_aspect_ratio(image))
	}else{
		image_width = container_box.width
		image_height = container_box.width * (1/image_aspect_ratio(image))
	}

	// calculates the margin necessary so that the image will be vertically
	// or horizontally alligned with the container.

	let margin_left = Math.abs(image_width - container_box.width)/2
	let margin_right = Math.abs(image_width - container_box.width)/2
	let margin_top = Math.abs(image_height - container_box.height)/2
	let margin_bottom = Math.abs(image_height - container_box.height)/2

	return {
		container_width: container_box.width,
		container_height: container_box.height,
		image_height: image_height,
		image_width: image_width,
		margin_left: margin_left,
		margin_right: margin_right,
		margin_top: margin_top,
		margin_bottom: margin_bottom
	}
}


export {
	calculate_centered_image_position,
	calculate_covering_image_position
}