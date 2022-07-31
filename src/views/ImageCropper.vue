<script setup>
import { ref, computed, defineProps, onMounted, onUnmounted, watch } from "vue";

import { convert_image_dimensions_to_pixels } from "../helpers/image_dimensions.js";

import { zoom } from "../helpers/zooming.js";

import { crop_area } from "../helpers/general.js";

import {
  start_image_dragging,
  image_drag,
  finish_image_dragging,
  center_image,
} from "../helpers/image_dragging.js";

import {
  finish_drag,
  start_drag,
  set_cursor_position,
  crop_window_setup,
  crop_window_teardown,
  update_crop_position,
} from "../helpers/crop_window.js";

const image_natural_width = ref(null);
const image_natural_height = ref(null);
const container_element = ref(null);
const crop_element = ref(null);
const zooming_timeout_id = ref(null);

const image_cropper_visibility = computed(() => {
  return props.container_visibility;
});

const background_image_source = computed(() => {
  return props.container_background_image;
});

const container_style = computed(() => {
  return {
    width: props.container_width,
    height: props.container_height,
    aspectRatio: props.container_aspect_ratio,
    backgroundImage: "url(" + props.container_background_image + ")",
    visibility: props.container_visibility,
  };
});

const draggable_style = computed(() => {
  return {
    width: props.draggable_width,
    height: props.draggable_height,
    aspectRatio: props.draggable_aspect_ratio,
  };
});

const props = defineProps({
  container_width: { type: String, default: "500px" },
  container_height: { type: String, default: "" },
  container_aspect_ratio: { type: [String, Number], default: "1 / 1" },
  draggable_width: { type: String, default: "200px" },
  draggable_height: { type: String, default: "" },
  draggable_aspect_ratio: { type: [String, Number], default: "2 / 1" },
  container_background_image: { type: String, default: "url('/flower.jpeg')" },
  container_visibility: { type: String },
});

watch(image_cropper_visibility, () => {
  crop_window_setup();
});

watch([crop_element, container_element], (current) => {
  if (current.shift() != null && current.shift() != null) {
    crop_window_setup();
  }
});

function set_image_dimensions() {
  const image = new Image();
  image.src = background_image_source.value;
  const natural_width = image.naturalWidth;
  const natural_height = image.naturalHeight;
  image_natural_width.value = natural_width;
  image_natural_height.value = natural_height;
  convert_image_dimensions_to_pixels();
}

function change_zoom(event) {
  const cursor_position = {
    x: event.pageX,
    y: event.pageY,
  };
  if (event.deltaY > 0) {
    zoom(cursor_position, "out");
  } else {
    zoom(cursor_position, "in");
  }
  event.preventDefault();
}

function zooming_in() {
  const crop_box = crop_area().getBoundingClientRect();
  const cursor_position = {
    x: crop_box.left + crop_box.width / 2,
    y: crop_box.top + crop_box.height / 2,
  };
  zoom(cursor_position, "in");
}

function zooming_out() {
  const crop_box = crop_area().getBoundingClientRect();
  const cursor_position = {
    x: crop_box.left + crop_box.width / 2,
    y: crop_box.top + crop_box.height / 2,
  };
  zoom(cursor_position, "out");
}

function keep_zooming_in() {
  zooming_in();
  const id = setTimeout(keep_zooming_in, 50);
  zooming_timeout_id.value = id;
}

function stop_zooming_in() {
  clearTimeout(zooming_timeout_id.value);
}

function keep_zooming_out() {
  zooming_out();
  const id = setTimeout(keep_zooming_out, 50);
  zooming_timeout_id.value = id;
}

function stop_zooming_out() {
  clearTimeout(zooming_timeout_id.value);
}

onMounted(() => {
  set_image_dimensions();
});

onUnmounted(() => {
  crop_window_teardown();
});
</script>

<template>
  <main
    ref="container_element"
    @wheel="change_zoom"
    @drag="image_drag"
    @dragstart="start_image_dragging"
    @dragend="finish_image_dragging"
    :style="container_style"
    id="crop-container"
    draggable="true"
  >
    <div
      ref="crop_element"
      :style="draggable_style"
      @mousedown="set_cursor_position"
      @dragstart="start_drag"
      @dragend="finish_drag"
      @drag="update_crop_position"
      id="crop-area"
      draggable="true"
    ></div>
    <div id="opacity-top"></div>
    <div id="opacity-bottom"></div>
    <div id="opacity-left"></div>
    <div id="opacity-right"></div>
    <div id="crop-controls">
      <button
        @mousedown="keep_zooming_in"
        @mouseup="stop_zooming_in"
        @mouseout="stop_zooming_in"
        id="zoom-in-button"
      >
        <img id="zoom-in" src="/zoom_plus.svg" />
        <div class="tooltip">Zoom in</div>
      </button>
      <button
        @mousedown="keep_zooming_out"
        @mouseup="stop_zooming_out"
        @mouseout="stop_zooming_out"
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
#second {
  z-index: 0;
  position: absolute;
  left: 0px;
  width: 200px;
  height: 100px;
  top: 0px;
  background-color: cornflowerblue;
}

#crop-container {
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
    border: 5px solid #ff3355;
    box-sizing: border-box;
  }

  #opacity-top {
    inset: 0 auto auto 0;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
    width: 200px;
    height: 0px;
  }

  #opacity-right {
    inset: 0 0 auto auto;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
    width: 300px;
    height: 500px;
  }

  #opacity-bottom {
    inset: auto auto 0 0;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
    width: 200px;
    height: 400px;
  }

  #opacity-left {
    inset: 0 auto auto 0;
    position: absolute;
    background-color: #000000;
    opacity: 0.7;
    width: 0px;
    height: 100px;
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
        bottom: -60px;
        z-index: 2;
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
          top: -45px;
          bottom: auto;
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
        bottom: -60px;
        z-index: 2;
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
          top: -45px;
          bottom: auto;
          animation: present_tooltip 1.5s;
        }
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
      bottom: -60px;
      z-index: 2;
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
        top: -45px;
        bottom: auto;
        animation: present_tooltip 1.5s;
      }
    }
  }
}
</style>
