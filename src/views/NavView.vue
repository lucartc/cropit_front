<script setup>
	import { useRouter } from 'vue-router'

	const router = useRouter()

	function go_to_home(event){
		router.push({name: 'home'})
	}

</script>

<template>
	<nav id="navbar">
		<div @click="go_to_home" id="logo-group">
			<span id="logo-text">CROP.IT</span>
		</div>
		<div id="navlinks">
			<span class="navlink"><img src="/github.svg"></span>
			<span class="navlink">Donate</span>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
	#navbar{
		font-family: helvetica;	
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;

		#logo-group{
			cursor: pointer;
			margin: 30px 0px 30px 90px;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: start;

			#logo-text{
				text-align: center;
				font-size: 2em;
				font-color: #000000;
				font-weight: bold;
			}
		}

		#navlinks{
			margin: 30px 90px 30px 90px;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: start;

			.navlink{
				margin: 0px 30px 0px 0px;
				font-size: 1.5em;

				&:last-child{
					margin: 0;
				}
			}
		}
	}
</style>