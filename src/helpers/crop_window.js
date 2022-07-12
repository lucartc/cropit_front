	import {ref, computed, triggerRef, shallowRef, onMounted, onUnmounted, nextTick} from 'vue'

	const container = shallowRef(null)
	const last_cursor_position = ref(null)
	const current_cursor_position = ref(null)
	const drag_started = ref(false)
	const drag_finished = ref(false)

	function update_crop_position(event){
		set_current_cursor_position(event)
		calculate_x_position()
		calculate_y_position()
		calculate_opacity_position()
		update_refs()
	}

	function set_current_cursor_position(event){
		current_cursor_position.value = {x: event.pageX, y: event.pageY}
	}

	function calculate_x_position(){
		let container_box = container.value.getBoundingClientRect()
		let crop = document.querySelector('#crop-window')
		let page_x = current_cursor_position.value.x
		let crop_box = crop.getBoundingClientRect()
		let left = crop_box.left - container_box.left

		if(cursor_is_not_at_screen_origin()){
			if(!drag_is_happening()){
				page_x = last_cursor_position.value.x
			}

			if(crop_should_move_x()){
				crop.style.left = (left+page_x-last_cursor_position.value.x).toString()+'px'
			}

			crop_box = crop.getBoundingClientRect()

			if(crop_box.left < container_box.left){
				crop.style.left = 0
			}

			crop_box = crop.getBoundingClientRect()

			if(crop_box.right > container_box.right){
				crop.style.left = (container_box.width - crop_box.width).toString()+'px'
			}

			last_cursor_position.value.x = page_x
		}
	}

	function crop_should_move_x(){
		return !crop_should_not_move_x()
	}

	function crop_should_not_move_x(){
		let x_coordinate = current_cursor_position.value.x
		let page_x = drag_is_happening() ? x_coordinate : last_cursor_position.value.x
		let displacement = page_x-last_cursor_position.value.x
		let should_not_move_to_right = null
		let should_not_move_to_left = null
		
		should_not_move_to_right = displacement > 0 && cursor_off_limits_left()
		should_not_move_to_left = displacement < 0 && cursor_off_limits_right()

		return should_not_move_to_right || should_not_move_to_left
	}

	function cursor_off_limits_left(){
		let container_box = container.value.getBoundingClientRect()
		let x_coordinate = current_cursor_position.value.x
		let page_x = drag_is_happening() ? x_coordinate : last_cursor_position.value.x
		return page_x < container_box.left
	}

	function cursor_off_limits_right(){
		let container_box = container.value.getBoundingClientRect()
		let x_coordinate = current_cursor_position.value.x
		let page_x = drag_is_happening() ? x_coordinate : last_cursor_position.value.x
		return page_x > container_box.right
	}

	function calculate_y_position(){
		let container_box = container.value.getBoundingClientRect()
		let crop = document.querySelector('#crop-window')
		let page_y = current_cursor_position.value.y
		let crop_box = crop.getBoundingClientRect()
		let top = crop_box.top - container_box.top

		if(cursor_is_not_at_screen_origin()){
			if(!drag_is_happening()){
				page_y = last_cursor_position.value.y
			}

			if(crop_should_move_y()){
				crop.style.top = (top+page_y-last_cursor_position.value.y).toString()+'px'
			}

			crop_box = crop.getBoundingClientRect()

			if(crop_box.top < container_box.top){
				crop.style.top = 0
			}

			crop_box = crop.getBoundingClientRect()

			if(crop_box.bottom > container_box.bottom){
				crop.style.top = (container_box.height - crop_box.height).toString()+'px'
			}

			last_cursor_position.value.y = page_y
		}
	}

	function crop_should_move_y(){
		return !crop_should_not_move_y()
	}

	function crop_should_not_move_y(){
		let y_coordinate = current_cursor_position.value.y
		let page_y = drag_is_happening() ? y_coordinate : last_cursor_position.value.y
		let displacement = page_y-last_cursor_position.value.y
		let should_not_move_to_top = null
		let should_not_move_to_bottom = null
		
		should_not_move_to_top = displacement < 0 && cursor_off_limits_bottom()
		should_not_move_to_bottom = displacement > 0 && cursor_off_limits_top()

		return should_not_move_to_top || should_not_move_to_bottom
	}

	function cursor_off_limits_top(){
		let y_coordinate = current_cursor_position.value.y
		let container_box = container.value.getBoundingClientRect()
		let page_y = drag_is_happening() ? y_coordinate : last_cursor_position.value.y
		return page_y < container_box.top
	}

	function cursor_off_limits_bottom(){
		let y_coordinate = current_cursor_position.value.y
		let container_box = container.value.getBoundingClientRect()
		let page_y = drag_is_happening() ? y_coordinate : last_cursor_position.value.y
		return page_y > container_box.bottom
	}

	function cursor_is_not_at_screen_origin(){
		let page_x = current_cursor_position.value.x
		let page_y = current_cursor_position.value.y
		return page_x != 0 || page_y != 0
	}

	function drag_is_happening(){
		return drag_started.value && !drag_finished.value
	}

	function calculate_opacity_position(){
		calculate_opacity_top_position()
		calculate_opacity_right_position()
		calculate_opacity_bottom_position()
		calculate_opacity_left_position()
	}

	function calculate_opacity_top_position(){
		let container_box = container.value.getBoundingClientRect()
		let crop = document.querySelector('#crop-window')
		let opacity_top = document.querySelector('#opacity-top')
		let crop_box = crop.getBoundingClientRect()
		let style = opacity_top.style

		style.left = crop.style.left
		style.width = (container_box.right - crop_box.left).toString()+'px'
		style.height = (crop_box.top - container_box.top).toString()+'px'
	}

	function calculate_opacity_right_position(){
		let container_box = container.value.getBoundingClientRect()
		let crop = document.querySelector('#crop-window')
		let opacity_right = document.querySelector('#opacity-right')
		let crop_box = crop.getBoundingClientRect()
		let style = opacity_right.style

		style.top = crop.style.top
		style.width = (container_box.right - crop_box.right).toString()+'px'
		style.height = (container_box.bottom - crop_box.top).toString()+'px'
	}

	function calculate_opacity_bottom_position(){
		let container_box = container.value.getBoundingClientRect()
		let crop = document.querySelector('#crop-window')
		let opacity_bottom = document.querySelector('#opacity-bottom')
		let crop_box = crop.getBoundingClientRect()
		let style = opacity_bottom.style

		style.top = crop_box.bottom - container_box.top
		style.width = (crop_box.right - container_box.left).toString()+'px'
		style.height = (container_box.bottom - crop_box.bottom).toString()+'px'
	}

	function calculate_opacity_left_position(){
		let container_box = container.value.getBoundingClientRect()
		let crop = document.querySelector('#crop-window')
		let opacity_left = document.querySelector('#opacity-left')
		let crop_box = crop.getBoundingClientRect()
		let style = opacity_left.style

		style.left = container_box.left
		style.width = (crop_box.left - container_box.left).toString()+'px'
		style.height = (crop_box.bottom - container_box.top).toString()+'px'
	}

	function update_refs(){
		container.value = document.querySelector('#image-cropper')
		triggerRef(container)
	}

	function finish_drag(event){
		drag_finished.value = true;
		update_crop_position(event)
		reset_positions()
	}

	function set_current_resizing_position(){
		let crop = document.querySelector('#crop-window')
		let crop_box = crop.getBoundingClientRect()
		let container_box = container.value.getBoundingClientRect()

		current_cursor_position.value = {
			x: container_box.left,
			y: container_box.top
		}

		last_cursor_position.value = {
			x: container_box.left,
			y: container_box.top
		}
	}

	function reset_positions(){
		last_cursor_position.value = null
		current_cursor_position.value = null
	}

	function set_last_cursor_position(event){
		last_cursor_position.value = {x: event.pageX,y: event.pageY}
	}

	function add_resize_listener(){
		window.addEventListener('resize',adjust_component_size)
	}

	function remove_resize_listener(){
		window.addEventListener('resize',adjust_component_size)
	}

	function adjust_component_size(){
		triggerRef(container)
		nextTick(() => {
			setup_drag_flags()
			set_current_resizing_position()
			calculate_x_position()
			calculate_y_position()
			calculate_opacity_position()
		})
	}

	function crop_window_setup(){
		calculate_opacity_position()
		add_resize_listener()
	}
	
	function crop_window_teardown(){
		remove_resize_listener()
	}

	function start_drag(event){
		hide_ghost(event)
		setup_drag_flags()
	}

	function hide_ghost(event){
		let container = document.createElement('div')
		event.dataTransfer.setDragImage(container,0,0);
	}

	function setup_drag_flags(){
		drag_started.value = true
		drag_finished.value = false
	}

	export {
		container,
		set_last_cursor_position as set_cursor_position,
		start_drag,
		finish_drag,
		crop_window_setup,
		crop_window_teardown,
		update_crop_position,
	}