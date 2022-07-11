<script setup>
	import {ref, computed, triggerRef, shallowRef, defineProps, onMounted, watch, reactive, nextTick, onUnmounted} from 'vue'

	const container = shallowRef(null)
	const last_cursor_position = ref(null)
	const current_cursor_position = ref(null)
	const drag_started = ref(false)
	const drag_finished = ref(false)
	const draggable_aspect_ratio = ref(props.draggable_aspect_ratio)
	const draggable_width = ref(props.draggable_width)
	const draggable_height = ref(props.draggable_height)
	const container_aspect_ratio = ref(props.container_aspect_ratio)
	const container_width = ref(props.container_width)
	const container_height = ref(props.container_height)
	const container_background_image = ref(props.container_background_image)

	const container_style = computed(() => {
		return {
			width: props.container_width,
			height: props.container_height,
			aspectRatio: props.container_aspect_ratio,
			backgroundImage: props.container_background_image
		}
	})

	const draggable_style = computed(() => {
		return {
			width: props.draggable_width,
			height: props.draggable_height,
			aspectRatio: props.draggable_aspect_ratio
		}
	})

	const props = defineProps({
		container_width: { type: String, default: '500px'},
		container_height: { type: String, default: ''},
		container_aspect_ratio: { type: [String,Number], default: '1 / 1'},
		draggable_width: { type: String, default: '200px'},
		draggable_height: { type: String, default: ''},
		draggable_aspect_ratio: { type: [String,Number], default: '2 / 1'},
		container_background_image: {type: String, default: "url('/flower.jpeg')"},
	})

	watch(draggable_style,() => nextTick(calculate_opacity_position))

	function update_draggable_position(event){
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
		let draggable = document.querySelector('#crop-window')
		let page_x = current_cursor_position.value.x
		let draggable_box = draggable.getBoundingClientRect()
		let left = draggable_box.left - container_box.left

		if(cursor_is_not_at_screen_origin()){
			if(!drag_is_happening()){
				page_x = last_cursor_position.value.x
			}

			if(draggable_should_move_x()){
				draggable.style.left = (left+page_x-last_cursor_position.value.x).toString()+'px'
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.left < container_box.left){
				draggable.style.left = 0
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.right > container_box.right){
				draggable.style.left = (container_box.width - draggable_box.width).toString()+'px'
			}

			last_cursor_position.value.x = page_x
		}
	}

	function draggable_should_move_x(){
		return !draggable_should_not_move_x()
	}

	function draggable_should_not_move_x(){
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
		let draggable = document.querySelector('#crop-window')
		let page_y = current_cursor_position.value.y
		let draggable_box = draggable.getBoundingClientRect()
		let top = draggable_box.top - container_box.top

		if(cursor_is_not_at_screen_origin()){
			if(!drag_is_happening()){
				page_y = last_cursor_position.value.y
			}

			if(draggable_should_move_y()){
				draggable.style.top = (top+page_y-last_cursor_position.value.y).toString()+'px'
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.top < container_box.top){
				draggable.style.top = 0
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.bottom > container_box.bottom){
				draggable.style.top = (container_box.height - draggable_box.height).toString()+'px'
			}

			last_cursor_position.value.y = page_y
		}
	}

	function draggable_should_move_y(){
		return !draggable_should_not_move_y()
	}

	function draggable_should_not_move_y(){
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
		let draggable = document.querySelector('#crop-window')
		let opacity_top = document.querySelector('#opacity-top')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_top.style

		style.left = draggable.style.left
		style.width = (container_box.right - draggable_box.left).toString()+'px'
		style.height = (draggable_box.top - container_box.top).toString()+'px'
	}

	function calculate_opacity_right_position(){
		let container_box = container.value.getBoundingClientRect()
		let draggable = document.querySelector('#crop-window')
		let opacity_right = document.querySelector('#opacity-right')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_right.style

		style.top = draggable.style.top
		style.width = (container_box.right - draggable_box.right).toString()+'px'
		style.height = (container_box.bottom - draggable_box.top).toString()+'px'
	}

	function calculate_opacity_bottom_position(){
		let container_box = container.value.getBoundingClientRect()
		let draggable = document.querySelector('#crop-window')
		let opacity_bottom = document.querySelector('#opacity-bottom')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_bottom.style

		style.top = draggable_box.bottom - container_box.top
		style.width = (draggable_box.right - container_box.left).toString()+'px'
		style.height = (container_box.bottom - draggable_box.bottom).toString()+'px'
	}

	function calculate_opacity_left_position(){
		let container_box = container.value.getBoundingClientRect()
		let draggable = document.querySelector('#crop-window')
		let opacity_left = document.querySelector('#opacity-left')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_left.style

		style.left = container_box.left
		style.width = (draggable_box.left - container_box.left).toString()+'px'
		style.height = (draggable_box.bottom - container_box.top).toString()+'px'
	}

	function update_refs(){
		container.value = document.querySelector('#image-cropper')
		triggerRef(container)
	}

	function finish_drag(event){
		event.preventDefault()
		drag_finished.value = true;
		update_draggable_position(event)
		reset_positions()
	}

	function reset_positions(){
		last_cursor_position.value = null
		current_cursor_position.value = null
	}

	function setup_drag(event){
		hide_ghost(event)
		start_drag()
	}

	function hide_ghost(event){
		let container = document.createElement('div')
		event.dataTransfer.setDragImage(container,0,0);
	}

	function start_drag(){
		drag_started.value = true
		drag_finished.value = false
	}

	function set_last_cursor_position(event){
		last_cursor_position.value = {x: event.pageX,y: event.pageY}
	}

	function adjust_component_size(){
		triggerRef(container)
		nextTick(() => {
			start_drag()
			set_current_resizing_position()
			calculate_x_position()
			calculate_y_position()
			calculate_opacity_position()
			finish_drag()
		})
	}

	function set_current_resizing_position(){
		let draggable = document.querySelector('#crop-window')
		let draggable_box = draggable.getBoundingClientRect()
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

	function add_resize_listener(){
		window.addEventListener('resize',adjust_component_size)
	}

	function remove_resize_listener(){
		window.addEventListener('resize',adjust_component_size)
	}

	onMounted(() => {
		calculate_opacity_position()
		add_resize_listener()
	})

	onUnmounted(() => {
		remove_resize_listener()
	})
</script>

<template>
	<main :style="container_style"  ref="container" id="image-cropper">
		<div :style="draggable_style" @mousedown="set_last_cursor_position" @dragstart="setup_drag" @dragend="finish_drag" @drag="update_draggable_position" id="crop-window" draggable="true"></div>
		<div id="opacity-top"></div>
		<div id="opacity-bottom"></div>
		<div id="opacity-left"></div>
		<div id="opacity-right"></div>
	</main>
</template>

<style lang="scss" scoped>
	#second{
		z-index: 0;
		position: absolute;
		left: 0px;
		width: 200px;
		height: 100px;
		top: 0px;
		background-color: cornflowerblue;
	}

	#image-cropper{
		background-position: center;
		background-size: contain;
		background-repeat: no-repeat;
		display: flex;
		flex-direction: column;
		align-items: start;
		justify-content: start;
		position: relative;
		background-color: #cccccc;

		#crop-window{
			z-index: 3;
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			color: #ffffff;
			font-size: 1em;
			cursor: grab;
			position: absolute;
			background-color: transparent;
			border: 5px solid white;
			box-sizing: border-box;
		}

		#opacity-top{
			inset: 0 auto auto 0;
			position: absolute;
			background-color: #000000;
			opacity: 0.7;
			width: 200px;
			height: 0px;
		}

		#opacity-right{
			inset: 0 0 auto auto;
			position: absolute;
			background-color: #000000;
			opacity: 0.7;
			width: 300px;
			height: 500px;
		}

		#opacity-bottom{
			inset: auto auto 0 0;
			position: absolute;
			background-color: #000000;
			opacity: 0.7;
			width: 200px;
			height: 400px;
		}

		#opacity-left{
			inset: 0 auto auto 0;
			position: absolute;
			background-color: #000000;
			opacity: 0.7;
			width: 0px;
			height: 100px;
		}
	}
</style>