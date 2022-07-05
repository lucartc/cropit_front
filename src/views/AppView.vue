<script setup>
	import NavView from './NavView.vue'

	function toggle_help(event){
		let help = document.getElementById('left')
		let middle = document.getElementById('middle')
		let right = document.getElementById('right')

		if(help.style.display == 'none'){
			help.style.display = 'flex'
			middle.className = 'middle-small'
			right.className = 'right-small'
		}else{
			help.style.display = 'none'
			middle.className = 'middle-big'
			right.className = 'right-big'
		}
	}
</script>

<template>
	<main id="container">
		<div id="left">
			<span id="help-title">How to use</span>
			<p id="help-text">
				Click in the central button “import your image” to select the desired image. Then, you may add each aspect ratio by clicking in “Add aspect ratio” or you can add them all by importing the adequate JSON containing all the aspect ratios. If you want more advanced uses, with more than one image at a time, checkout out API.
			</p>
		</div>
		<div id="middle" class="middle-small">
			<div id="display">
				<div id="previous-image"></div>
				<div id="next-image"></div>
				<div id="current-image">
					<button id="import-image"><img id="import-image-icon" src="/import.svg"> Import image</button>
				</div>
			</div>
			<div id="button-bar">
				<button id="previous"><img id="previous-icon" src="/left.svg"></button>
				<button id="next"><img id="next-icon" src="/right.svg"></button>
				<button id="download-images"><img id="download-icon" src="/download.svg"></button>
				<button @click="toggle_help" id="help"><img id="help-icon" src="/help.svg"></button>
			</div>
		</div>
		<div id="right" class="right-small">
			<button id="add-aspect-ratio"><img id="add-aspect-ratio-icon" src="/add.svg"> Add aspect ratio</button>
			<div id="aspect-ratio-list">
				<div class="aspect-ratio-item">16:9 <img class="aspect-ratio-item-icon" src="/remove.svg"/></div>
				<div class="aspect-ratio-item">4:3 <img class="aspect-ratio-item-icon" src="/remove.svg"/></div>
				<div class="aspect-ratio-item">6:13 <img class="aspect-ratio-item-icon" src="/remove.svg"/></div>
				<div class="aspect-ratio-item">2:1 <img class="aspect-ratio-item-icon" src="/remove.svg"/></div>
			</div>
			<button id="import-json"><img id="import-json-icon" src="/import.svg">Import JSON</button>
			<textarea id="json-container"></textarea>
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
			display: flex;
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
				margin: 0px 0px 20px 0px;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				width: 80%;
				aspect-ratio: 2;
				max-width: 100%;
				position: relative;

				#previous-image{
					border-radius: 5px;
					z-index: 0;
					left: -20px;
					position: absolute;
					background-color: #777777;
					max-width: 40%;
					width: 40%;
					aspect-ratio: 2;
				}
				#next-image{
					border-radius: 5px;
					z-index: 0;
					right: -20px;
					position: absolute;
					background-color: #555555;
					max-width: 40%;
					width: 40%;
					aspect-ratio: 2;
				}

				#current-image{
					border-radius: 5px;
					z-index: 1;
					background-color: #aaaaaa;
					max-width: 100%;
					width: 100%;
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

				#previous, #next, #download-images, #help{
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

				#previous-icon, #next-icon, #download-icon, #help-icon{
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

			#json-container{
				margin: 20px 0px 0px 0px;
				width: 50%;
				aspect-ratio: 2;
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