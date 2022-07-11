<script setup>
	import NavView from './NavView.vue'
	import ImageCropper from './ImageCropper.vue'
	import { ref, reactive, computed, watch, onUpdated } from 'vue'

	const current_image_index = ref(-1)
	const width = ref(1)
	const height = ref(1)
	const example_json = ref('# Example: {"ratios": [{"width": 1,"height": 1}]}')
	const image_object_src = ref(null)
	const json_string = ref('')
	const json_error_message = ref('JSON is not valid!')

	const image_cropper_props = reactive({
		container_width: '',
		container_height: '100%',
		container_aspect_ratio: '2',
		draggable_width: '20%',
		draggable_height: '',
		draggable_aspect_ratio: '1',
		container_background_image: null
	})

	const aspect_ratios = computed(() => {
		try{
			return JSON.parse(json_string.value.trim()).ratios
		}catch(error){
			return null
		}
	})

	const json_error = computed(() => {
		if(!aspect_ratios_valid() && json_string_not_empty()){
			return true
		}else if(!aspect_ratios_valid() && json_string_empty()){
			return false
		}else{
			return !valid_json()
		}
	})

	const textarea_class = computed(() => {
		return json_invalid() ? "textarea_error" : "textarea_default"
	})

	watch(aspect_ratios,(current,previous) => {
		if(aspect_ratios_not_empty()){
			current_image_index.value = 0
		}
		update_active_aspect_ratio()
	})

	watch(current_image_index,(current,previous)=> {
		update_active_aspect_ratio()
	})

	function json_invalid(){
		return json_error.value
	}

	function json_string_empty(){
		return json_string.value.length == 0
	}

	function json_string_not_empty(){
		return !json_string_empty()
	}

	function aspect_ratios_empty(){
		return aspect_ratios_valid() && aspect_ratios.value.length == 0
	}

	function aspect_ratios_not_empty(){
		return aspect_ratios_valid() && aspect_ratios.value.length > 0
	}

	function update_active_aspect_ratio(){
		let aspect_ratio_items = null
		let active_aspect_ratio = null
		let all_aspect_ratios = null

		aspect_ratio_items = document.querySelectorAll('.aspect-ratio-item')
		active_aspect_ratio = document.querySelectorAll('.aspect-ratio-item-active')
		aspect_ratio_items = Array.from(aspect_ratio_items)
		active_aspect_ratio = Array.from(active_aspect_ratio)
		all_aspect_ratios = aspect_ratio_items.concat(active_aspect_ratio)

		if(all_aspect_ratios.length > 0){
			set_active_aspect_ratio_item(all_aspect_ratios)
			update_crop_window_aspect_ratio()
		}
	}

	function set_active_aspect_ratio_item(aspect_ratio_items){
		aspect_ratio_items.forEach((item) => {
			let item_id = parseInt(item.id)
			let current_image_id = current_image_index.value
			let is_active = (item_id == current_image_id)
			let active_class = 'aspect-ratio-item-active'
			let not_active_class = 'aspect-ratio-item'
			item.className = (is_active ? active_class : not_active_class)
		})
	}

	function update_crop_window_aspect_ratio(){
		let aspect_ratio = document.querySelector('.aspect-ratio-item-active')
		let aspect_ratio_value = aspect_ratio.innerText.split(':').join(' / ')
		image_cropper_props.draggable_aspect_ratio = aspect_ratio_value
	}

	function aspect_ratios_valid(){
		return aspect_ratios.value != null
	}

	function aspect_ratios_invalid(){
		return !aspect_ratios_valid()
	}

	function valid_json(){
		if(aspect_ratios_not_empty()){
			let valid_items = valid_aspect_ratios()
			return (valid_items.length != aspect_ratios.value.length ? false : true)
		}
		return false
	}

	function valid_aspect_ratios(){
		return aspect_ratios.value.filter(item => validate_aspect_ratio(item))
	}

	function validate_aspect_ratio(item){
		return item.hasOwnProperty('width') && item.hasOwnProperty('height')
	}

	function toggle_add_aspect_ratio(event){
		let form = document.querySelector('#add-aspect-ratio-group')
		let style = form.style
		style.display = (style.display == '' ? 'flex' : '')
	}

	function toggle_json_textarea(event){
		let textarea = document.querySelector('#json-container')
		let json_error_label = document.querySelector('#json-error')
		let style = textarea.style

		style.display = (style.display == '' ? 'initial' : '')

		if(json_error_label != null){
			json_error_label.style.display = style.display
		}
	}

	function toggle_help(event){
		let help = document.querySelector('#left')
		let middle = document.querySelector('#middle')
		let right = document.querySelector('#right')

		if(help.style.display == ''){
			help.style.display = 'flex'
			middle.className = 'middle-small'
			right.className = 'right-small'
		}else{
			help.style.display = ''
			middle.className = 'middle-big'
			right.className = 'right-big'
		}
	}

	function import_image(event){
		let image_picker = document.querySelector('#import-image-input')
		image_picker.click()
	}

	function set_image_object(event){
		let image = Array.from(event.target.files).pop()
		let current_image_element = document.querySelector('#current-image')
		let style = current_image_element.style

		image_object_src.value = URL.createObjectURL(image)
		style.backgroundImage = 'url('+ image_object_src.value +')'
		style.backgroundSize = 'cover'
		image_cropper_props.container_background_image = style.backgroundImage
	}

	function add_aspect_ratio(event){
		let ratios = {width: width.value, height: height.value}

		if(aspect_ratios_invalid()){
			json_string.value = JSON.stringify({ratios: [ratios]})
		}else{
				let json_obj = JSON.parse(json_string.value)
				json_obj.ratios.push(ratios)
				json_string.value = JSON.stringify(json_obj)
		}

		reset_width_and_height()
	}

	function reset_width_and_height(){
		width.value = 1;
		height.value = 1;
	}

	function update_current_image_aspect_ratio(){
		let current_image = document.querySelector('#current-image')
		let aspect_ratio = null
		let style = current_image.style

		if(aspect_ratios_not_empty()){
			aspect_ratio = aspect_ratios.value[current_image_index.value]
		}

		if(aspect_ratio != null){
			let width = parseFloat(aspect_ratio.width)
			let height = parseFloat(aspect_ratio.height)

			style.aspectRatio = aspect_ratio.width+'/'+aspect_ratio.height

			if(width > height){
				style.width = '100%'
				style.height = 'auto'
			}else{
				style.width = 'auto'
				style.height = '100%'
			}

		}else{
			style.aspectRatio = '2'
			style.width = '100%'
			style.height = 'auto'
		}
	}

	function remove_aspect_ratio(event){
		let id = event.target.parentElement.id
		
		if(aspect_ratios_valid()){
			let json = JSON.parse(json_string.value).ratios
			let old_json = json.slice()
			json.splice(parseInt(id),1)
			let new_image_index = json.indexOf(old_json[current_image_index.value])

			if(json.length > 0){
				json_string.value = JSON.stringify({ratios: json})
			}else{
				json_string.value = ''
			}

			if(new_image_index < 0){
				current_image_index.value = 0
			}else{
				current_image_index.value = new_image_index
			}
		}
	}

	function next_image(event){
		if(aspect_ratios_valid()){
			if(current_image_index.value == aspect_ratios.value.length-1){
				current_image_index.value = 0
			}else{
				current_image_index.value += 1
			}
		}
	}

	function previous_image(event){
		if(aspect_ratios_valid()){
			if(current_image_index.value == 0){
				current_image_index.value = aspect_ratios.value.length-1
			}else{
				current_image_index.value -= 1
			}
		}
	}

	function display_aspect_ratio(event){
		if(event.target.tagName != 'IMG'){
			let aspect_ratio_index = event.target.id
			current_image_index.value = parseInt(aspect_ratio_index)
		}
	}

	function clear_image(event){
		image_cropper_props.container_background_image = null
		image_object_src.value = null
	}

	onUpdated(() => {
		update_active_aspect_ratio()
	})
</script>

<template>
	<main id="container">
		<div id="left">
			<span id="help-title">How to use</span>
			<p id="help-text">
				Click in the central button “import your image” to select the desired image. Then, you may add each aspect ratio by clicking in “Add aspect ratio” or you can add them all by importing the adequate JSON containing all the aspect ratios. If you want more advanced uses, with more than one image at a time, checkout out API.
			</p>
		</div>
		<div id="middle" class="middle-big">
			<div id="display">
				<div id="current-image" v-if="!image_object_src">
					<form hidden>
						<input @change="set_image_object" type="file" id="import-image-input" name="image" hidden>
					</form>
					<button @click="import_image" id="import-image"><img id="import-image-icon" src="/import.svg"> Import image</button>
				</div>
				<ImageCropper v-if="image_object_src" v-bind="image_cropper_props" />
			</div>
			<div id="button-bar">
				<button @click="previous_image" id="previous"><img id="previous-icon" src="/left.svg"></button>
				<button @click="next_image" id="next"><img id="next-icon" src="/right.svg"></button>
				<button id="download-images"><img id="download-icon" src="/download.svg"></button>
				<button v-if="image_object_src" @click="clear_image" id="clear"><img id="clear-icon" src="/remove.svg"></button>
				<button @click="toggle_help" id="help"><img id="help-icon" src="/help.svg">
					<div class="tooltip">Toggle help</div>
				</button>
			</div>
		</div>
		<div id="right" class="right-big">
			<button @click="toggle_add_aspect_ratio" id="add-aspect-ratio"><img id="add-aspect-ratio-icon" src="/add.svg"> Add aspect ratio</button>
			<div id="add-aspect-ratio-group">
				<div id="width-group">
					<label>Width:</label>
					<input v-model="width" type="number" min="0.01" step="0.01" name="width">
				</div>
				<div id="height-group">
					<label>Height:</label>
					<input v-model="height" type="number" min="0.01" step="0.01" name="height">
				</div>
				<button @click="add_aspect_ratio" id="confirm-button">OK</button>
			</div>
			<div id="aspect-ratio-list" v-if="!json_error">
				<div @click="display_aspect_ratio" v-for="ratio in aspect_ratios" :key="aspect_ratios.indexOf(ratio)" :id="aspect_ratios.indexOf(ratio)" class="aspect-ratio-item">{{ratio.width}}:{{ratio.height}}<img @click="remove_aspect_ratio" class="aspect-ratio-item-icon" src="/remove.svg"/></div>
			</div>
			<button @click="toggle_json_textarea" id="import-json"><img id="import-json-icon" src="/import.svg">Import JSON</button>
			<label v-if="json_error" id="json-error">{{ json_error_message }}</label>
			<textarea v-model="json_string" :class="textarea_class" id="json-container" :placeholder="example_json"></textarea>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	#container{
		margin: 0px 90px 20px 90px;
		color: #333333;
		font-family: helvetica;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: start;
		justify-content: center;

		#left{
			margin: 60px 20px 0px 40px;
			display: none;
			flex-direction: column;
			align-items: start;
			justify-content: start;
			max-width: 30%;
			min-width: 30%;

			#help-title{
				font-size: 1.5em;
			}

			#help-text{
				line-height: 1.5;
			}
		}
		
		#middle{
			margin: 60px 20px 0px 20px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: start;

			#display{
				background-color: #f0e0e0;
				margin: 0px 0px 20px 0px;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				width: 80%;
				aspect-ratio: 2;
				max-width: 80%;
				position: relative;

				#current-image{
					border-radius: 5px;
					z-index: 1;
					background-color: #aaaaaa;
					max-height: 100%;
					max-width: 100%;
					height: 100%;
					aspect-ratio: 2;
					position: relative;

					#import-image{
						white-space: nowrap;
						padding: 10px 40px 10px 40px;
						color: #ffffff;
						border: none;
						background-color: #ff3355;
						border-radius: 5px;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: center;
						position: absolute;
						z-index: 2;
						top: calc(50% - 25px);
						bottom: auto;
						left: calc(50% - 116px);
						right: auto;
						font-size: 1.2em;

						#import-image-icon{
							margin: 0px 10px 0px 0px;
							height: 30px;
							aspect-ratio: 1;
						}
					}
				}
			}

			#button-bar{
				width: 80%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: start;

				#previous, #next, #download-images, #help, #clear{
					border-radius: 5px;
					display: flex;
					position: relative;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					padding: 10px;
					border: none;
					background-color: #ff3355;
					margin: 0px 10px 0px 0px;

					&:last-child{
						margin: 0px 0px 0px auto;
						border-radius: 50%;
					}

					.tooltip{
						background-color: #cccccc;
						border-radius: 5px;
						top: -50px;
						z-index: 2;
						position: absolute;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						opacity: 0;
						transition: opacity 0.5s;
						padding: 5px 10px 5px 10px;
						font-size: 1.2em;
						color: #333333;
						text-align: center;
					}

					&:hover{
						.tooltip{
							opacity: 1;
						}
					}
				}

				#previous-icon, #next-icon, #download-icon, #help-icon, #clear-icon{
					height: 30px;
					aspect-ratio: 1;
				}
			}
		}
		
		.middle-big{
			min-width: 40%;
		}

		.middle-small{
			min-width: 30%;
		}

		#right{
			margin: 60px 40px 0px 20px;
			display: flex;
			flex-direction: column;
			align-items: start;
			justify-content: start;

			#add-aspect-ratio{
				white-space: nowrap;
				background-color: #ff3355;
				border-radius: 5px;
				border: none;
				display: flex;
				color: #ffffff;
				flex-direction: row;
				align-items: center;
				justify-content: start;
				font-size: 1.2em;
				padding: 10px 40px 10px 40px;

				#add-aspect-ratio-icon{
					height: 30px;
					aspect-ratio: 1;
					margin: 0px 20px 0px 0px;
				}
			}

			#add-aspect-ratio-group{
				margin: 10px 0px 10px 0px;
				display: none;
				flex-direction: row;
				flex-wrap: nowrap;
				align-items: end;

				#width-group, #height-group{
					margin: 10px 15px 0px 0px;
					display: flex;
					flex-direction: column;

					label{
						margin: 0px 0px 5px 0px;
						font-size: 1.2em;
					}

					input{
						height: 30px;
						border-radius: 5px;
						border: 1px solid #333333;
						width: 60px;
						font-size: 1.2em;
						padding: 5px 10px 5px 10px;
					}
				}

				#confirm-button{
					color: #ffffff;
					font-size: 1.2em;
					border-radius: 5px;
					border: none;
					height: 40px;
					aspect-ratio: 1;
					background-color: #44dd44;
				}
			}

			#aspect-ratio-list{
				margin: 10px 0px 0px 0px;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;

				.aspect-ratio-item{
					border-radius: 5px;
					color: #ffffff;
					font-size: 1.2em;
					font-weight: bold;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					margin: 0px 10px 10px 0px;
					width: 150px;
					height: 60px;
					background-color: #555555;

					&:first-child{
						margin: 0px 10px 10px 0px;
					}

					&:last-child{
						margin: 0px 10px 20px 0px;
					}

					.aspect-ratio-item-icon{
						margin: 0px 0px 0px 20px;
						height: 30px;
						aspect-ratio: 1;
						color: #ffffff;
					}
				}

				.aspect-ratio-item-active{
					border-radius: 5px;
					color: #ffffff;
					font-size: 1.2em;
					font-weight: bold;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					margin: 0px 10px 10px 0px;
					width: 150px;
					height: 60px;
					background-color: cornflowerblue;

					&:first-child{
						margin: 0px 10px 10px 0px;
					}

					&:last-child{
						margin: 0px 10px 20px 0px;
					}

					.aspect-ratio-item-icon{
						margin: 0px 0px 0px 20px;
						height: 30px;
						aspect-ratio: 1;
						color: #ffffff;
					}
				}

			}

			#import-json{
				white-space: nowrap;
				border-radius: 5px;
				color: #ffffff;
				background-color: #ff3355;
				border: none;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: start;
				font-size: 1.2em;
				padding: 10px 40px 10px 40px;

				#import-json-icon{
					height: 30px;
					aspect-ratio: 1;
					margin: 0px 20px 0px 0px;
				}
			}

			#json-error{
				text-align: left;
				font-size: 1.2em;
				color: #ff1133;
				padding: 5px 20px 5px 0px;
				margin:  20px 0px 0px 0px;
			}

			#json-container{
				display: none;
				margin: 20px 0px 0px 0px;
				width: 50%;
				aspect-ratio: 2;
			}

			.textarea_error{
				border: 1px solid #ff3355;
				color: #ff3355;

				&:focus-visible{
					border: 1px solid #ff3355;
					color: #ff3355;					
				}
			}
		}

		.right-big{
			max-width: fit-content;
		}

		.right-small{
			max-width: fit-content;
		}
	}

@media screen and (max-width: 1100px){
		#container{
			margin: 0px 0px 20px 0px;
			align-items: center;

			#left{
				min-width: 80%;
				max-width: 80%;
				margin: 60px 20px 0px 20px;
			}

			#middle{
				margin: 60px 20px 0px 20px;
			}

			.middle-big{
				min-width: 80%;
			}

			.middle-small{
				min-width: 80%;
			}

			#right{
				margin: 60px 20px 0px 20px;
				align-items: center;

				#aspect-ratio-list{
					justify-content: center;
				}
			}

			.right-big{
				min-width: 80%;
			}

			.right-small{
				min-width: 80%;
			}
		}
}
</style>