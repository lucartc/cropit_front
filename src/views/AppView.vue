<script setup>
	import NavView from './NavView.vue'
	import { ref, reactive, computed, watch, onUpdated } from 'vue'

	const current_image_index = ref(-1)
	const width = ref(1)
	const height = ref(1)
	const example_json = ref('# For aspect ratio 1:1 => {"ratios": [{"width": 1,"height": 1}]}')
	const image_object_src = ref(null)
	const json_string = ref('')
	const json_error_message = ref('JSON is not valid!')

	const aspect_ratios = computed(() => {
		try{
			return JSON.parse(json_string.value.trim()).ratios
		}catch(error){
			return null
		}
	})

	const json_error = computed(() => {
		if(!is_aspect_ratios_valid() && json_string.value.length > 0){
			return true
		}
		else if(!is_aspect_ratios_valid() && json_string.value.length == 0){
			return false 
		}else{
			return !validate_json()
		}
	})

	const textarea_class = computed(() => {
		return json_error.value ? "textarea_error" : "textarea_default"
	})

	watch(aspect_ratios,(current,previous) => {
		console.log('changed...')
		if(is_aspect_ratios_valid() && aspect_ratios.value.length > 0){
			current_image_index.value = aspect_ratios.value.length-1
		}
		update_active_aspect_ratio()
		update_current_image_aspect_ratio()
	})

	watch(current_image_index,(current,previous)=> {
		console.log('current: ',current)
		let current_image = document.getElementById('current-image')
		update_active_aspect_ratio()
		update_current_image_aspect_ratio()
	})

	function update_active_aspect_ratio(){
		let aspect_ratio_items = Array.from(document.getElementsByClassName('aspect-ratio-item'))
		let aspect_ratio_items_active = Array.from(document.getElementsByClassName('aspect-ratio-item-active'))
		let all_aspect_ratio_item_elements = aspect_ratio_items.concat(aspect_ratio_items_active)

		if(all_aspect_ratio_item_elements.length > 0){
			all_aspect_ratio_item_elements.forEach((item) => {
				if(parseInt(item.id) == parseInt(current_image_index.value)){
					item.className = 'aspect-ratio-item-active'
				}else{
					item.className = 'aspect-ratio-item'
				}
			})
		}
	}

	function is_aspect_ratios_valid(){
		return aspect_ratios.value != null && aspect_ratios.value != undefined
	}

	function validate_json(){
		if(is_aspect_ratios_valid()){
			if(aspect_ratios.value.length == 0){
				return false
			}else{
				let valid_items = aspect_ratios.value.filter(item => item.hasOwnProperty('width') && item.hasOwnProperty('height'))
				if(valid_items.length != aspect_ratios.value.length || aspect_ratios.value.length == 0){
					return false
				}else{
					return true
				}
			}
		}else{
			return false
		}
	}

	function toggle_add_aspect_ratio(event){
		let form = document.getElementById('add-aspect-ratio-group')

		if(form.style.display == 'none' || form.style.display == ''){
			form.style.display = 'flex'
		}else{
			form.style.display = 'none'
		}
	}

	function toggle_json_textarea(event){
		let textarea = document.getElementById('json-container')
		let json_error_label = document.getElementById('json-error')

		if(textarea.style.display == 'none' || textarea.style.display == '' ){
			textarea.style.display = 'initial'
		}else{
			textarea.style.display = 'none'
		}
		
		if(json_error_label != undefined && json_error_label != null){
			json_error_label.style.display = textarea.style.display
		}
	}

	function toggle_help(event){
		let help = document.getElementById('left')
		let middle = document.getElementById('middle')
		let right = document.getElementById('right')

		if(help.style.display == 'none' || help.style.display == ''){
			help.style.display = 'flex'
			middle.className = 'middle-small'
			right.className = 'right-small'
		}else{
			help.style.display = 'none'
			middle.className = 'middle-big'
			right.className = 'right-big'
		}
	}

	function import_image(event){
		let image_picker = document.getElementById('import-image-input')
		image_picker.click()
	}

	function set_image_object(event){
		let image = Array.from(event.target.files).pop()
		let current_image = document.getElementById('current-image')

		image_object_src.value = URL.createObjectURL(image)
		console.log('setting image...')
		current_image.style.backgroundImage = 'url('+ image_object_src.value +')'
		current_image.style.backgroundSize = 'cover'
	}

	function add_aspect_ratio(event){
		let ratios = {width: width.value, height: height.value}

		if(aspect_ratios.value == null){
			json_string.value = JSON.stringify({ratios: [ratios]})
		}else{
			if(aspect_ratios.value instanceof Array){
				let json_obj = JSON.parse(json_string.value)
				json_obj.ratios.push(ratios)
				json_string.value = JSON.stringify(json_obj)
			}
		}

		width.value = 1;
		height.value = 1;
	}

	function update_current_image_aspect_ratio(){
		let current_image = document.getElementById('current-image')
		let aspect_ratio = null

		if(is_aspect_ratios_valid() && aspect_ratios.value.length > 0){
			aspect_ratio = aspect_ratios.value[current_image_index.value]
		}

		if(aspect_ratio != null){
			let width = parseFloat(aspect_ratio.width)
			let height = parseFloat(aspect_ratio.height)

			current_image.style.aspectRatio = aspect_ratio.width+'/'+aspect_ratio.height

			if(width > height){
				current_image.style.width = '100%'
				current_image.style.height = 'auto'
			}else{
				current_image.style.width = 'auto'
				current_image.style.height = '100%'
			}

		}else{
			current_image.style.aspectRatio = '2'
			current_image.style.width = '100%'
			current_image.style.height = 'auto'
		}
	}

	function remove_aspect_ratio(event){
		let id = event.target.parentElement.id
		if(aspect_ratios != null){
			let json_obj = JSON.parse(json_string.value).ratios
			let old_json_obj = json_obj.slice()
			json_obj.splice(parseInt(id),1)
			let new_current_image_index = json_obj.indexOf(old_json_obj[current_image_index.value])

			if(json_obj.length > 0){
				json_string.value = JSON.stringify({ratios: json_obj})
			}else{
				json_string.value = ''
			}

			if(new_current_image_index < 0){
				current_image_index.value = 0
			}else{
				current_image_index.value = new_current_image_index
			}
		}
	}

	function next_image(event){
		if(is_aspect_ratios_valid()){
			if(current_image_index.value == aspect_ratios.value.length-1){
				current_image_index.value = 0
			}else{
				current_image_index.value += 1
			}
		}
	}

	function previous_image(event){
		if(is_aspect_ratios_valid()){
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
		let form = document.getElementById('import-image-input').parentElement
		let current_image = document.getElementById('current-image')
		form.reset()
		current_image.style.backgroundImage = 'none'
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
				<div id="current-image">
					<form hidden>
						<input @change="set_image_object" type="file" id="import-image-input" name="image" hidden>
					</form>
					<button v-if="!image_object_src" @click="import_image" id="import-image"><img id="import-image-icon" src="/import.svg"> Import image</button>
				</div>
			</div>
			<div id="button-bar">
				<button @click="previous_image" id="previous"><img id="previous-icon" src="/left.svg"></button>
				<button @click="next_image" id="next"><img id="next-icon" src="/right.svg"></button>
				<button id="download-images"><img id="download-icon" src="/download.svg"></button>
				<button v-if="image_object_src" @click="clear_image" id="clear"><img id="clear-icon" src="/remove.svg"></button>
				<button @click="toggle_help" id="help"><img id="help-icon" src="/help.svg"></button>
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
			min-width: 40%;
			max-width: 40%;
		}

		.right-small{
			min-width: 30%;
			max-width: 30%;
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