function cursor_is_not_at_screen_origin(cursor_position){
	let page_x = cursor_position.x
	let page_y = cursor_position.y
	let viewport = {x: null, y: null}
	viewport.x = Math.trunc(window.scrollX)
	viewport.y = Math.trunc(window.scrollY)
	return page_x != viewport.x || page_y != viewport.y
}

function hide_ghost(event){
	let container = document.createElement('div')
	event.dataTransfer.setDragImage(container,0,0);
}

export {
	cursor_is_not_at_screen_origin,
	hide_ghost
}