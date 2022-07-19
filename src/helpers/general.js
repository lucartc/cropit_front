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

function container(){
	return document.querySelector('#crop-container')
}

function crop_area(){
  return document.querySelector('#crop-area')
};

function opacity_top(){
  return document.querySelector('#opacity-top')
};
function opacity_right(){
  return document.querySelector('#opacity-right')
};
function opacity_bottom(){
  return document.querySelector('#opacity-bottom')
};
function opacity_left(){
  return document.querySelector('#opacity-left')
};

export {
	cursor_is_not_at_screen_origin,
	hide_ghost,
	container,
	crop_area,
	opacity_top,
	opacity_right,
	opacity_bottom,
	opacity_left
}