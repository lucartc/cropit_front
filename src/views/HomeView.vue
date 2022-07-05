<script setup>
	import NavView from './NavView.vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()

	function go_to_app(event){
		router.push({name: 'app'})
	}

</script>

<template>
	<main id="container">
		<div id="left">
			<header id="header">One standard to rule them all.</header>
			<p id="subheader">Adequate your images to your project design by choosing the best aspect ratios.</p>
			<button @click="go_to_app" id="call-to-action">Get started!</button>
		</div>
		<div id="right">
			<svg width="574" height="433" viewBox="0 0 574 433" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g id="illustration">
					<rect id="r4" width="300" height="400" fill="#D9D9D9"/>
					<rect id="r3" x="300" width="100" height="200" fill="#B9B9B9"/>
					<rect id="r2" x="227" y="170" width="100" height="100" fill="#E89898"/>
					<rect id="r1" x="254" y="253" width="320" height="180" fill="#A2A2A2"/>
				</g>
			</svg>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	#container{
		flex-wrap: wrap;
		display: flex;
		flex-direction: row;
		align-items: start;
		justify-content: space-between;
		margin: 0px 0px 0px 90px;
		font-family: helvetica;
		color: #333333;

		#left{
			margin: 60px 0px 0px 0px;
			min-width: 40%;
			max-width: 40%;
			display: flex;
			flex-direction: column;
			align-items: start;
			justify-content: start;

			#header{
				//max-width: 80%;
				font-size: 5em;
				font-weight: bold;
				text-align: left;
			}

			#subheader{
				//max-width: 80%;
				margin: 30px 0px 0px 0px;
				font-size: 2em;
			}

			#call-to-action{
				max-width: 80%;
				border-radius: 10px;	 
				padding: 20px 40px 20px 40px;
				margin: 60px 0px 0px 0px;
				border: none;
				font-size: 2em;
				font-weight: bold;
				background-color: #ff33aa;
				color: white;
			}
		}

		#right{
			margin: 60px 0px 0px 0px;
			min-width: 40%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: start;
		}

		#r1{
			transform-origin: center;
			animation: r1a 3s ease-in-out infinite alternate;
		}

		#r2{
			transform-origin: center;
			animation: r2a 3s ease-in-out infinite alternate;
		}

		#r3{
			transform-origin: center;
			animation: r3a 3s ease-in-out infinite alternate;
		}

		#r4{
			transform-origin: center;
			animation: r4a 3s ease-in-out infinite alternate;
		}

		@keyframes r1a{
			from{
				fill: red;
				opacity: 0.5;
				transform: translateX(65px) translateY(-55px) rotateZ(0deg);
			}

			to{
				fill: purple;
				opacitY: 1;
				transform: translateX(0px) translateY(0px) rotateZ(90deg);
			}
		}

		@keyframes r2a{
			from{
				transform: translateX(90px) translateY(-190px);
			}

			to{
				transform: translateX(0px) translateY(0px);
			}
		}

		@keyframes r3a{
			from{
				opacity: 1;
				transform: translateX(15px) translateY(-140px) rotateZ(90deg);
			}

			to{
				opacitY: 0.5;
				transform: translateX(0px) translateY(0px) rotateZ(0deg);
			}
		}

		@keyframes r4a{
			from{
				fill: lightblue;
				opacity: 0.5;
				transform: translateX(10px) translateY(-20px);
			}

			to{
				fill: #ffdd55;
				opacitY: 1;
				transform: translateX(0px) translateY(0px);
			}
		}

	}

	@media screen and (max-width: 960px){
		#container{
			justify-content: center;

			#left{
				align-items: center;

				#header{
					text-align: center;
				}

				#subheader{
					text-align: center;
				}
			}
		}	
	}
</style>