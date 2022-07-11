<script setup>
	import {ref, computed, reactive, triggerRef, shallowRef, defineProps, onMounted} from 'vue'
	import ImageCropper from './ImageCropper.vue'

	const image_cropper_props = reactive({
		container_width: '',
		container_height: '100%',
		container_aspect_ratio: '2',
		draggable_width: '20%',
		draggable_height: '',
		draggable_aspect_ratio: '1',
		container_background_image: null
	})

</script>

<template>
	<ImageCropper v-bind="image_cropper_props"/>
</template>

<style lang="scss" scoped>
</style>