import { container, crop_area } from './general.js'

function crop_container(){
	return container()
}

function crop(){
	let container_box = crop_container().getBoundingClientRect()
	let crop_box = crop_area().getBoundingClientRect()
	let image_position = getComputedStyle(crop_container()).backgroundPosition
	let image_size = getComputedStyle(crop_container()).backgroundSize
	let image_source = getComputedStyle(crop_container()).backgroundImage

	let new_image_position = {
		x: parseFloat(image_position.split('px',2).shift().trim()) - (crop_box.left - container_box.left),
		y: parseFloat(image_position.split('px',2).pop().trim()) - (crop_box.top - container_box.top)
	}

	return{
		width: parseFloat(image_size.split('px',2).shift().trim()),
		height: parseFloat(image_size.split('px',2).pop().trim()),
		top: new_image_position.y,
		left: new_image_position.x,
		container_width: crop_box.width,
		container_height: crop_box.height,
		source: image_source.replace('url("','').replace('")','')
	}
}

export {
	crop
}