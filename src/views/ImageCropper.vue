<script setup>
	import {ref, computed, triggerRef, shallowRef, defineProps, onMounted, watch, reactive, nextTick, onUnmounted} from 'vue'
	import { calculate_centered_image_position, calculate_covering_image_position } from '../helpers/calculations.js'
	import { finish_drag, start_drag, set_cursor_position ,crop_window_setup, crop_window_teardown, update_crop_position} from '../helpers/crop_window.js'

	const draggable_aspect_ratio = ref(props.draggable_aspect_ratio)
	const draggable_width = ref(props.draggable_width)
	const draggable_height = ref(props.draggable_height)
	const container_aspect_ratio = ref(props.container_aspect_ratio)
	const container_width = ref(props.container_width)
	const container_height = ref(props.container_height)
	const container_background_image = ref(props.container_background_image)
	const image_aspect_ratio = ref(null)
	const another_container = ref(null)

	const container_style = computed(() => {
		return {
			width: props.container_width,
			height: props.container_height,
			aspectRatio: props.container_aspect_ratio,
			backgroundImage: 'url('+props.container_background_image+')'
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
		container_background_image: { type: String, default: "url('/flower.jpeg')"}
	})

	watch(draggable_style,() => nextTick(calculate_opacity_position))

	function set_image_aspect_ratio(){
		let image = new Image()
		image.src = container_background_image.value
		let natural_width = image.naturalWidth
		let natural_height = image.naturalHeight
		image_aspect_ratio.value = natural_width/natural_height
	}

	function change_zoom(event){
		console.log('changing zoom...')
	}

	function zoom_in(event){
		console.log('zooming in...')
	}

	function zoom_out(event){
		console.log('zooming out...')
	}

	onMounted(() => {
		crop_window_setup()
		set_image_aspect_ratio()
	})

	onUnmounted(() => {
		crop_window_teardown()
	})
</script>

<template>
	<main @wheel="change_zoom" :style="container_style" id="image-cropper">
		<div :style="draggable_style" @mousedown="set_cursor_position" @dragstart="start_drag" @dragend="finish_drag" @drag="update_crop_position" id="crop-window" draggable="true"></div>
		<div id="opacity-top"></div>
		<div id="opacity-bottom"></div>
		<div id="opacity-left"></div>
		<div id="opacity-right"></div>
		<div id="zoom-controls">
			<button @click="zoom_in" id="zoom-in-button"><img id="zoom-in" src="/add.svg"></button>
			<button @click="zoom_out" id="zoom-out-button"><img id="zoom-out" src="/minus.svg"></button>
		</div>
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

		#zoom-controls{
			right: -60px;
			position: absolute;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			#zoom-in-button{
				border: none;
				border-radius: 5px 5px 0px 0px;
				background-color: #333333;
				width: 50px;
				aspect-ratio: 1;
				#zoom-in{
					width: 30px;
					aspect-ratio: 1;
				}
			}

			#zoom-out-button{
				margin: 5px 0px 0px 0px;
				border: none;
				border-radius: 0px 0px 5px 5px;
				background-color: #333333;
				width: 50px;
				aspect-ratio: 1;
				
				#zoom-out{
					width: 30px;
					aspect-ratio: 1;
				}
			}
		}
	}
</style>