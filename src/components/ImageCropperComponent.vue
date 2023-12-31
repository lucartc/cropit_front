<script setup>
import { ref, computed, onUnmounted, watch, nextTick } from "vue"

import { convert_image_dimensions_to_pixels } from "../helpers/image_dimensions.js"

import { zoom } from "../helpers/zooming.js"

import { crop, download_cropped_images } from "../helpers/cropping.js"

import {
  start_image_dragging,
  drag_image,
  finish_image_dragging,
  center_image,
} from "../helpers/image_dragging.js"

import {
  finish_crop_window_drag,
  start_crop_window_drag,
  set_cursor_position,
  crop_window_setup,
  crop_window_teardown,
  update_crop_position,
} from "../helpers/crop_window.js"

const image_natural_width = ref(null)
const image_natural_height = ref(null)
const container_element = ref(null)
const crop_element = ref(null)
const zooming_timeout_id = ref(null)

const background_image_source = computed(() => {
  return props.container_background_image
})

const container_style = computed(() => {
  return {
    width: props.container_width,
    height: props.container_height,
    aspectRatio: props.container_aspect_ratio,
    backgroundImage: "url(" + props.container_background_image + ")",
    display: props.container_display ? 'flex' : 'none'
  }
})

const crop_area_style = computed(() => {
  if(crop_element.value && container_element.value){
    let container_width = container_element.value.getBoundingClientRect().width
    let container_height = container_element.value.getBoundingClientRect().height
    let minimum_side = container_width * 0.2
    let ratio = props.crop_area_aspect_ratio.replace(' ','').split('/')
    let ratio_width = parseFloat(ratio[0])
    let ratio_height = ratio.length == 1 ? parseFloat(ratio[0]) : parseFloat(ratio[1])
    let new_crop_window_width = crop_element.value.getBoundingClientRect().width
    let new_crop_window_height = new_crop_window_width * ratio_height/ratio_width

    if(ratio_height == ratio_width){
      new_crop_window_height = ''
      new_crop_window_width = '20%'
    }else{
      new_crop_window_height = ratio_height > ratio_width ?  (minimum_side/container_height*100)+'%' : ''
      new_crop_window_width = ratio_height > ratio_width ? '' : '20%'
    }

    return {
      width: new_crop_window_width,
      height: new_crop_window_height,
      aspectRatio: props.crop_area_aspect_ratio,
    }
  }else{
    return {
      width: '20%',
      height: '',
      aspectRatio: props.crop_area_aspect_ratio,
    }
  }

})

const props = defineProps({
  container_width: { type: String, default: "500px" },
  container_height: { type: String, default: "" },
  container_aspect_ratio: { type: [String, Number], default: "1 / 1" },
  crop_area_aspect_ratio: { type: [String, Number], default: "2 / 1" },
  container_background_image: { type: String },
  container_display: {type: Boolean, default: false }
})

defineExpose({
  crop_image,
  download_images,
  show,
  hide
})

watch(crop_area_style,async function(){
  crop_window_teardown()
  await nextTick()
  crop_window_setup()
  set_image_dimensions()
})

watch(background_image_source,async function(current){
  if(!current){
    clear_container_background()
    crop_window_teardown()
  }else{
    crop_window_setup()
    set_image_dimensions()
  }
})

watch([crop_element, container_element], (current) => {
  if (current.shift() && current.shift()) {
    crop_window_setup()
  }
})

function show(){
  const style = container_element.value.style
  style.display = 'flex'
}

function hide(){
  const style = container_element.value.style
  style.display = 'none' 
}

function clear_container_background(){
  const style = container_element.value.style
  style.backgroundPosition = ""
  style.backgroundSize = ""
}

function crop_image(){
  return crop()
}

function download_images(images){
  return download_cropped_images(images)
}

async function set_image_dimensions() {
  await nextTick()
  const image = new Image()
  image.src = background_image_source.value
  const natural_width = image.naturalWidth
  const natural_height = image.naturalHeight
  image_natural_width.value = natural_width
  image_natural_height.value = natural_height
  convert_image_dimensions_to_pixels()
}

function change_zoom(event) {
  const cursor_position = {
    x: event.pageX,
    y: event.pageY,
  }
  if (event.deltaY > 0) {
    zoom(cursor_position, "out")
  } else {
    zoom(cursor_position, "in")
  }
  event.preventDefault()
}

function zooming_in() {
  const crop_box = crop_element.value.getBoundingClientRect()
  const cursor_position = {
    x: crop_box.left + crop_box.width / 2,
    y: crop_box.top + crop_box.height / 2,
  }
  zoom(cursor_position, "in")
}

function zooming_out() {
  const crop_box = crop_element.value.getBoundingClientRect()
  const cursor_position = {
    x: crop_box.left + crop_box.width / 2,
    y: crop_box.top + crop_box.height / 2,
  }
  zoom(cursor_position, "out")
}

function keep_zooming_in() {
  zooming_in()
  const id = setTimeout(keep_zooming_in, 50)
  zooming_timeout_id.value = id
}

function stop_zooming_in() {
  clearTimeout(zooming_timeout_id.value)
}

function keep_zooming_out() {
  zooming_out()
  const id = setTimeout(keep_zooming_out, 50)
  zooming_timeout_id.value = id
}

function stop_zooming_out() {
  clearTimeout(zooming_timeout_id.value)
}

onUnmounted(() => {
  crop_window_teardown()
})
</script>

<template>
  <main
    ref="container_element"
    @wheel="change_zoom"
    @dragover="drag_image"
    @dragstart="start_image_dragging"
    @dragend="finish_image_dragging"
    @touchstart="start_image_dragging"
    @touchmove="drag_image"
    @touchend="finish_image_dragging"
    :style="container_style"
    id="crop-container"
    draggable="true"
  >
    <div
      ref="crop_element"
      :style="crop_area_style"
      @pointerdown="set_cursor_position"
      @dragstart="start_crop_window_drag"
      @dragend="finish_crop_window_drag"
      @dragover="update_crop_position"
      @touchstart="start_crop_window_drag"
      @touchmove="update_crop_position"
      @touchend="finish_crop_window_drag"
      id="crop-area"
      draggable="true"
    ></div>
    <div id="opacity-top"></div>
    <div id="opacity-bottom"></div>
    <div id="opacity-left"></div>
    <div id="opacity-right"></div>
    <div id="crop-controls">
      <button
        @pointerdown="keep_zooming_in"
        @pointerup="stop_zooming_in"
        @pointerout="stop_zooming_in"
        id="zoom-in-button"
      >
        <img id="zoom-in" src="/zoom_plus.svg" />
        <div class="tooltip">Zoom in</div>
      </button>
      <button
        @pointerdown="keep_zooming_out"
        @pointerup="stop_zooming_out"
        @pointerout="stop_zooming_out"
        id="zoom-out-button"
      >
        <img id="zoom-out" src="/zoom_minus.svg" />
        <div class="tooltip">Zoom out</div>
      </button>
      <button
        @click="center_image"
        id="home-button">
        <img id="home" src="/home.svg" />
        <div class="tooltip">Center image</div>
      </button>
    </div>
  </main>
</template>

<style lang="scss" scoped>
#crop-container {
  box-sizing: border-box;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  position: relative;
  background-color: #cccccc;

  #crop-area {
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
    border: 5px solid #ff3355;
    box-sizing: border-box;
  }

  #opacity-top {
    inset: 0 0 auto auto;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
  }

  #opacity-right {
    inset: auto 0 0 auto;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
  }

  #opacity-bottom {
    inset: auto auto 0 0;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
  }

  #opacity-left {
    inset: 0 auto auto 0;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
  }

  #crop-controls {
    top: 10px;
    right: 10px;
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    #zoom-in-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 5px 5px 0px 0px;
      background-color: #ff3355;
      width: 30px;
      aspect-ratio: 1;
      position: relative;

      #zoom-in {
        width: 18px;
        aspect-ratio: 1;
      }

      .tooltip {
        background-color: #cccccc;
        border-radius: 5px;
        bottom: 0px;
        left: -80px;
        position: absolute;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        padding: 5px 10px 5px 10px;
        font-size: 1em;
        color: #333333;
        text-align: center;
      }

      @keyframes present_tooltip {
        0% {
          opacity: 0;
        }

        30% {
          opacity: 1;
        }

        60% {
          opacity: 1;
        }

        100% {
          opacity: 0;
        }
      }

      &:hover {
        .tooltip {
          display: flex;
          animation: present_tooltip 1.5s;
        }
      }
    }

    #zoom-out-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 5px 0px 0px 0px;
      border: none;
      border-radius: 0px 0px 5px 5px;
      background-color: #ff3355;
      width: 30px;
      aspect-ratio: 1;
      position: relative;

      #zoom-out {
        width: 18px;
        aspect-ratio: 1;
      }

      .tooltip {
        background-color: #cccccc;
        border-radius: 5px;
        bottom: 0px;
        left: -90px;
        position: absolute;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        padding: 5px 10px 5px 10px;
        font-size: 1em;
        color: #333333;
        text-align: center;
      }

      @keyframes present_tooltip {
        0% {
          opacity: 0;
        }

        30% {
          opacity: 1;
        }

        60% {
          opacity: 1;
        }

        100% {
          opacity: 0;
        }
      }

      &:hover {
        .tooltip {
          display: flex;
          animation: present_tooltip 1.5s;
        }
      }
    }

    #home-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 5px 0px 0px 0px;
      border: none;
      border-radius: 5px 5px 5px 5px;
      background-color: #ff3355;
      width: 30px;
      aspect-ratio: 1;
      position: relative;

      #home {
        width: 18px;
        aspect-ratio: 1;
      }

      .tooltip {
        background-color: #cccccc;
        border-radius: 5px;
        bottom: 0px;
        left: -110px;
        position: absolute;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        padding: 5px 10px 5px 10px;
        font-size: 1em;
        color: #333333;
        text-align: center;
      }

      @keyframes present_tooltip {
        0% {
          opacity: 0;
        }

        30% {
          opacity: 1;
        }

        60% {
          opacity: 1;
        }

        100% {
          opacity: 0;
        }
      }

      &:hover {
        .tooltip {
          display: flex;
          animation: present_tooltip 1.5s;
        }
      }
    }
  }

}
</style>
