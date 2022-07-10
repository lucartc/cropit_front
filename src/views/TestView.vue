<script setup>
	import { ref, reactive, computed, watch, triggerRef, shallowRef, defineProps, onMounted} from 'vue'

	const test = ref('800px')
	const container = shallowRef(null)
	const cursor_position = ref(null)
	const drag_started = ref(false)
	const drag_finished = ref(false)
	const container_box = computed(() => container.value.getBoundingClientRect())

	const props = defineProps({
		container_width: { type: String, default: '500px'},
		container_height: { type: String, default: ''},
		container_aspect_ratio: { type: [String,Number], default: '1'},
		draggable_width: { type: String, default: '200px'},
		draggable_height: { type: String, default: ''},
		draggable_aspect_ratio: { type: [String,Number], default: '2'}
	})

	const container_style = ref({
		width: props.container_width,
		height: props.container_height,
		aspectRatio: props.container_aspect_ratio
	})

	const draggable_style = ref({
		width: props.draggable_width,
		height: props.draggable_height,
		aspectRatio: props.draggable_aspect_ratio
	})

	function update_draggable_position(event){
		calculate_x_position(event)
		calculate_y_position(event)
		calculate_opacity_position(event)
		update_refs()
	}

	function update_refs(){
		container.value = document.getElementById('container')
		triggerRef(container)
	}

	function calculate_x_position(event){
		let draggable = event.target
		let page_x = event.pageX
		let draggable_box = draggable.getBoundingClientRect()
		let left = draggable_box.left - container_box.value.left

		if(cursor_is_not_at_screen_origin(event)){
			if(!drag_is_happening()){
				page_x = cursor_position.value.x
			}

			if(draggable_should_move_x(event)){
				draggable.style.left = (left+page_x-cursor_position.value.x).toString()+'px'
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.left < container_box.value.left){
				draggable.style.left = 0
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.right > container_box.value.right){
				draggable.style.left = (container_box.value.width - draggable_box.width).toString()+'px'
			}

			cursor_position.value.x = page_x
		}
	}

	function calculate_y_position(event){
		let draggable = event.target
		let page_y = event.pageY
		let draggable_box = draggable.getBoundingClientRect()
		let top = draggable_box.top - container_box.value.top

		if(cursor_is_not_at_screen_origin(event)){
			if(!drag_is_happening()){
				page_y = cursor_position.value.y
			}

			if(draggable_should_move_y(event)){
				draggable.style.top = (top+page_y-cursor_position.value.y).toString()+'px'
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.top < container_box.value.top){
				draggable.style.top = 0
			}

			draggable_box = draggable.getBoundingClientRect()

			if(draggable_box.bottom > container_box.value.bottom){
				draggable.style.top = (container_box.value.height - draggable_box.height).toString()+'px'
			}

			cursor_position.value.y = page_y
		}
	}

	function cursor_is_not_at_screen_origin(event){
		return event.pageX != 0 || event.pageY != 0
	}

	function calculate_opacity_position(event){
		calculate_opacity_top_position(event)
		calculate_opacity_right_position(event)
		calculate_opacity_bottom_position(event)
		calculate_opacity_left_position(event)
	}

	function calculate_opacity_top_position(event){
		let draggable = document.getElementById('crop-window')
		let opacity_top = document.getElementById('opacity-top')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_top.style

		style.left = draggable.style.left
		style.width = (container_box.value.right - draggable_box.left).toString()+'px'
		style.height = (draggable_box.top - container_box.value.top).toString()+'px'
	}

	function calculate_opacity_right_position(event){
		let draggable = document.getElementById('crop-window')
		let opacity_right = document.getElementById('opacity-right')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_right.style

		style.top = draggable.style.top
		style.width = (container_box.value.right - draggable_box.right).toString()+'px'
		style.height = (container_box.value.bottom - draggable_box.top).toString()+'px'
	}

	function calculate_opacity_bottom_position(event){
		let draggable = document.getElementById('crop-window')
		let opacity_bottom = document.getElementById('opacity-bottom')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_bottom.style

		style.top = draggable_box.bottom - container_box.value.top
		style.width = (draggable_box.right - container_box.value.left).toString()+'px'
		style.height = (container_box.value.bottom - draggable_box.bottom).toString()+'px'
	}

	function calculate_opacity_left_position(event){
		let draggable = document.getElementById('crop-window')
		let opacity_left = document.getElementById('opacity-left')
		let draggable_box = draggable.getBoundingClientRect()
		let style = opacity_left.style

		style.left = container_box.value.left
		style.width = (draggable_box.left - container_box.value.left).toString()+'px'
		style.height = (draggable_box.bottom - container_box.value.top).toString()+'px'
	}

	function drag_is_happening(){
		return drag_started.value && !drag_finished.value
	}

	function cursor_off_limits_x(event){
		let draggable_box = event.target.getBoundingClientRect()
		return cursor_off_limits_left(event) || cursor_off_limits_right(event)
	}

	function cursor_off_limits_left(event){
		let page_x = drag_is_happening() ? event.pageX : cursor_position.value.x
		return page_x < container_box.value.left
	}

	function cursor_off_limits_right(event){
		let page_x = drag_is_happening() ? event.pageX : cursor_position.value.x
		return page_x > container_box.value.right
	}

	function draggable_should_move_y(event){
		return !draggable_should_not_move_y(event)
	}

	function draggable_should_move_x(event){
		return !draggable_should_not_move_x(event)
	}

	function draggable_should_not_move_x(event){
		let page_x = drag_is_happening() ? event.pageX : cursor_position.value.x
		let displacement = page_x-cursor_position.value.x
		let should_not_move_to_right = null
		let should_not_move_to_left = null
		
		should_not_move_to_right = displacement > 0 && cursor_off_limits_left(event)
		should_not_move_to_left = displacement < 0 && cursor_off_limits_right(event)

		return should_not_move_to_right || should_not_move_to_left
	}

	function draggable_should_not_move_y(event){
		let page_y = drag_is_happening() ? event.pageY : cursor_position.value.y
		let displacement = page_y-cursor_position.value.y
		let should_not_move_to_top = null
		let should_not_move_to_bottom = null
		
		should_not_move_to_top = displacement < 0 && cursor_off_limits_bottom(event)
		should_not_move_to_bottom = displacement > 0 && cursor_off_limits_top(event)

		return should_not_move_to_top || should_not_move_to_bottom
	}

	function cursor_off_limits_y(event){
		return cursor_off_limits_top(event) || cursor_off_limits_bottom(event)
	}

	function cursor_off_limits_top(event){
		let page_y = drag_is_happening() ? event.pageY : cursor_position.value.y
		return page_y < container_box.value.top
	}

	function cursor_off_limits_bottom(event){
		let page_y = drag_is_happening() ? event.pageY : cursor_position.value.y
		return page_y > container_box.value.bottom
	}

	function finish_drag(event){
		event.preventDefault()
		drag_finished.value = true;
		update_draggable_position(event)
		reset_positions()
	}

	function reset_positions(){
		cursor_position.value = null
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

	function set_cursor_position(event){
		cursor_position.value = {x: event.pageX,y: event.pageY}
	}
</script>

<template>
	<main :style="container_style"  ref="container" id="container">
		<div :style="draggable_style" @mousedown="set_cursor_position" @dragstart="setup_drag" @dragend="finish_drag" @drag="update_draggable_position" id="crop-window" draggable="true"></div>
		<div id="opacity-top"></div>
		<div id="opacity-bottom"></div>
		<div id="opacity-left"></div>
		<div id="opacity-right"></div>
	</main>
</template>

<style lang="scss" scoped>
	#second{
		z-index: 0;
		position:absolute;
		left: 0px;
		width: 200px;
		height: 100px;
		top: 0px;
		background-color: cornflowerblue;
	}

	#container{
		background-image: url('/flower.jpeg');
		background-size: cover;
		background-repeat: no-repeat;
		margin: 0px 0px 0px 300px;
		display: flex;
		flex-direction: column;
		align-items: start;
		justify-content: start;
		position: relative;
		background-color: #cccccc;
		//width: 500px;
		//height: 500px;

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
			//width: 200px;
			//aspect-ratio: 2;
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