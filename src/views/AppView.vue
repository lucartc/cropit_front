<script setup>
import ImageCropperComponent from "../components/ImageCropperComponent.vue"
import WaitComponent from "../components/WaitComponent.vue"
import { ref, reactive, watch, onUpdated } from "vue"
import NavComponent from "../components/NavComponent.vue"

const current_image_index = ref(-1)
const width = ref(1)
const height = ref(1)
const image_object_src = ref(null)
const cropped_images = ref([])
const image_cropper = ref(null)
const spinner = ref(null)
const aspect_ratios = ref([])

const image_cropper_props = reactive({
  container_width: "",
  container_height: "100%",
  container_aspect_ratio: "2",
  crop_area_aspect_ratio: "1",
  container_background_image: "",
  container_display: false
})

watch(current_image_index, () => {
  update_active_aspect_ratio()
})

watch(cropped_images.value, () => {
  render_cropped_images()
})

function update_active_aspect_ratio() {
  let aspect_ratio_items = null
  let active_aspect_ratio = null
  let all_aspect_ratios = null

  aspect_ratio_items = document.querySelectorAll(".aspect-ratio-item")
  active_aspect_ratio = document.querySelectorAll(".aspect-ratio-item-active")
  aspect_ratio_items = Array.from(aspect_ratio_items)
  active_aspect_ratio = Array.from(active_aspect_ratio)
  all_aspect_ratios = [...aspect_ratio_items, ...active_aspect_ratio]

  if (all_aspect_ratios.length > 0) {
    set_active_aspect_ratio_item(all_aspect_ratios)
    update_crop_window_aspect_ratio()
  }else{
    image_cropper_props.crop_area_aspect_ratio = '1 / 1'
  }
}

function set_active_aspect_ratio_item(aspect_ratio_items) {
  aspect_ratio_items.forEach((item) => {
    const item_id = parseInt(item.id)
    const current_image_id = current_image_index.value
    const is_active = item_id == current_image_id
    const active_class = "aspect-ratio-item-active"
    const not_active_class = "aspect-ratio-item"
    item.className = is_active ? active_class : not_active_class
  })
}

function update_crop_window_aspect_ratio() {
  const aspect_ratio = document.querySelector(".aspect-ratio-item-active")
  const aspect_ratio_value = aspect_ratio.innerText.split(":").join(" / ")
  image_cropper_props.crop_area_aspect_ratio = aspect_ratio_value
}


function validate_aspect_ratio(item) {
  return item.hasOwnProperty("width") && item.hasOwnProperty("height")
}

function toggle_add_aspect_ratio() {
  const form = document.querySelector("#add-aspect-ratio-group")
  const style = form.style
  style.display = style.display == "" ? "flex" : ""
}

function import_image() {
  const image_picker = document.querySelector("#import-image-input")
  image_picker.click()
}

function set_image_object(event) {
  const image = Array.from(event.target.files).pop()
  image_object_src.value = URL.createObjectURL(image)
  image_cropper_props.container_background_image = image_object_src.value
  image_cropper_props.container_display = true
  image_cropper.value.show()
}

function add_aspect_ratio() {
  const ratio = { width: width.value, height: height.value }
  aspect_ratios.value.push(ratio)
  if(aspect_ratios.value.length == 1){
    current_image_index.value = 0
  }
  reset_form_width_and_height()
  update_active_aspect_ratio()
}

function reset_form_width_and_height() {
  width.value = 1
  height.value = 1
}

function remove_aspect_ratio(event) {
  const id = event.target.parentElement.id
  const json = aspect_ratios.value
  const old_json = json.slice()
  
  json.splice(parseInt(id), 1)
  
  const new_image_index = json.indexOf(old_json[current_image_index.value])

  if (new_image_index < 0) {
    current_image_index.value = 0
  } else {
    current_image_index.value = new_image_index
  }
}

function display_aspect_ratio(event) {
  if (event.target.tagName != "IMG") {
    const aspect_ratio_index = event.target.id
    current_image_index.value = parseInt(aspect_ratio_index)
  }
}

function clear_image() {
  image_cropper.value.hide()
  image_cropper_props.container_background_image = null
  image_cropper_props.container_display = false
  image_object_src.value = null
}

function crop_image() {
  const new_crop = image_cropper.value.crop_image()
  store_cropped_image(new_crop)
}

function store_cropped_image(image) {
  cropped_images.value.push(image)
}

function render_cropped_images() {
  remove_all_cropped_images()
  const images = cropped_images.value
  images.forEach((image,index) => {
    const carroussel_container = document.querySelector(
      "#carroussel-container"
    )
    const element = create_cropped_image_element(image,index)
    add_component_data_property(element,carroussel_container)
    carroussel_container.appendChild(element)
  })
}

function add_component_data_property(element,parent){
  let properties = Array.from(parent.attributes)
  properties = properties.map(item => item.name)
  
  const data_property = properties
                        .filter(item => item.match(/^data-.+$/))
                        .pop()
                        .split('data-')
                        .pop()

  const children = Array.from(element.children)
  children.forEach(child => child.dataset[data_property] = '')
  element.dataset[data_property] = ''
}

function remove_all_cropped_images() {
  const carroussel_container = document.querySelector(
    "#carroussel-container"
  )

  const children = Array.from(carroussel_container.children)
  children.forEach((child) => {
    carroussel_container.removeChild(child)
  })
}

function create_cropped_image_element(image,index) {
  const remove_element = document.createElement("div")
  remove_element.className = "remove_cropped_image"
  const div = document.createElement("div")
  const container_height = 60
  const container_width = container_height * (image.crop_window_width / image.crop_window_height)
  div.id = `cropped_image_${index}`
  div.className = "cropped-image"
  div.style.height = `${container_height}px`
  div.style.width = `${container_width}px`
  div.style.backgroundImage = `url("${image.source}")`
  div.style.backgroundSize = `${
     image.width * (container_width / image.crop_window_width)
  }px ${image.height * (container_height / image.crop_window_height)}px`
  div.style.backgroundPosition = `${
     image.left * (container_width / image.crop_window_width)
  }px ${image.top * (container_height / image.crop_window_height)}px`
  div.addEventListener('click',remove_cropped_image)
  div.appendChild(remove_element)
  return div
}

function remove_cropped_image(event){
  const parent = event.target.parentElement
  const id = parseInt(parent.id.split('_').pop())
  cropped_images.value.splice(id,1)
  render_cropped_images()
}

async function download_images(){
  start_spinner()
  image_cropper.value.download_images(cropped_images.value)
  .then(data => {
    setTimeout(stop_spinner,2000)
  })
  .catch(data => {
    setTimeout(stop_spinner,2000)
  })
}

function start_spinner(){
  spinner.value.show()
}

function stop_spinner(){
  spinner.value.hide()
}

onUpdated(() => {
  update_active_aspect_ratio()
})
</script>

<template>
  <div id="wrapper">
    <NavComponent/>
    <main id="container">
      <WaitComponent ref="spinner"/>
      <div id="middle" class="middle-big">
        <div id="display">
          <div id="image" v-if="!image_object_src">
            <form hidden>
              <input
                @change="set_image_object"
                type="file"
                id="import-image-input"
                name="image"
                hidden
              />
            </form>
            <button @click="import_image" id="import-image">
              <img id="import-image-icon" src="/import.svg" /> Import image
            </button>
          </div>
          <ImageCropperComponent v-bind="image_cropper_props" ref="image_cropper"/>
        </div>
        <div id="button-bar">
          <button @click="download_images" id="download-images" :disabled="cropped_images.length <= 0">
            <img id="download-icon" src="/download.svg" />
            <div class="tooltip">Download cropped images</div>
          </button>
          <button v-if="image_object_src" @click="clear_image" id="clear">
            <img id="clear-icon" src="/remove.svg" />
            <div class="tooltip">Reset image</div>
          </button>
          <button @click="crop_image" v-if="image_object_src" id="crop">
            <img id="crop-icon" src="/crop.svg" />
            <div class="tooltip">Crop image</div>
          </button>
        </div>
        <div id="cropped-images-carroussel">
          <div id="carroussel-container"></div>
        </div>
      </div>
      <div id="right" class="right-big">
        <button @click="toggle_add_aspect_ratio" id="add-aspect-ratio">
          <img id="add-aspect-ratio-icon" src="/add.svg" /> Add aspect ratio
        </button>
        <div id="add-aspect-ratio-group">
          <div id="width-group">
            <label>Width:</label>
            <input
              v-model="width"
              type="number"
              min="0.01"
              step="0.01"
              name="width"
            />
          </div>
          <div id="height-group">
            <label>Height:</label>
            <input
              v-model="height"
              type="number"
              min="0.01"
              step="0.01"
              name="height"
            />
          </div>
          <button @click="add_aspect_ratio" id="confirm-button">OK</button>
        </div>
        <div id="aspect-ratio-list">
          <div
            @click="display_aspect_ratio"
            v-for="ratio in aspect_ratios"
            :key="aspect_ratios.indexOf(ratio)"
            :id="aspect_ratios.indexOf(ratio)"
            class="aspect-ratio-item"
          >
            {{ ratio.width }}:{{ ratio.height
            }}<img
              @click="remove_aspect_ratio"
              class="aspect-ratio-item-icon"
              src="/remove.svg"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
#container {
  min-width: 100%;
  margin: 60px 0px 20px 0px;
  color: #333333;
  font-family: helvetica;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: start;
  justify-content: center;

  #middle {
    margin: 20px 20px 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    position: relative;

    #display {
      margin: 0px 0px 40px 0px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;
      width: 100%;
      aspect-ratio: 2 / 1;
      max-width: 100%;
      position: relative;

      #image {
        border-radius: 5px;
        background-color: #dddddd;
        max-height: 100%;
        max-width: 100%;
        height: 100%;
        aspect-ratio: 2 / 1;
        position: relative;
        box-shadow: 0px 2px 4px 0px rgba(#000000,0.25);

        #import-image {
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
          top: calc(50% - 40px);
          left: calc(50% - 180px);
          width: 360px;
          height: 80px;
          font-size: 1.5em;
          box-shadow: 2px 2px 4px 0px rgba(#000000,0.25);

          &:hover{
            background-color: #ff3377;
          }

          #import-image-icon {
            margin: 0px 10px 0px 0px;
            height: 30px;
            aspect-ratio: 1;
          }
        }
      }
    }

    #button-bar {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;

      #download-images,
      #help,
      #clear,
      #crop {
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
        box-shadow: 2px 2px 4px 0px rgba(#000000,0.25);

        &:hover{
          background-color: #ff3377;
        }

        .tooltip {
          background-color: #cccccc;
          border-radius: 5px;
          bottom: -60px;
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
            top: -60px;
            bottom: auto;
            animation: present_tooltip 1.5s;
          }
        }
      }

      #download-icon,
      #help-icon,
      #clear-icon,
      #crop-icon {
        height: 40px;
        aspect-ratio: 1;
      }
    }

    #cropped-images-carroussel {
      margin: 20px 0px 20px 0px;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      min-width: 100%;

      #carroussel-container{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .cropped-image{
          border-radius: 5px;
          background-repeat: no-repeat;
          margin: 10px 10px 0px 0px;
          box-shadow: 1px 1px 4px 0px #999999;
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background-color: #aaaaaa;

          .remove_cropped_image{
            visibility: hidden;
            width: 80%;
            height: 80%;
            position: absolute;
            background-image: url('/remove.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }

          &:hover{
            filter: grayscale(50%);

            .remove_cropped_image{
              visibility: visible;
            }
          }
        }
      }

    }
  }

  .middle-big {
    min-width: 50%;
    max-width: 50%;
  }

  .middle-small {
    min-width: 30%;
    max-width: 30%;
  }

  #right {
    margin: 20px 40px 0px 20px;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;

    #add-aspect-ratio {
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
      width: 100%;
      box-shadow: 2px 2px 4px 0px rgba(#000000,0.25);

      &:hover{
        background-color: #ff3377;
      }


      #add-aspect-ratio-icon {
        height: 30px;
        aspect-ratio: 1;
        margin: 0px 20px 0px 0px;
      }
    }

    #add-aspect-ratio-group {
      margin: 10px 0px 10px 0px;
      display: none;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: end;

      #width-group,
      #height-group {
        margin: 10px 15px 0px 0px;
        display: flex;
        flex-direction: column;

        label {
          margin: 0px 0px 5px 0px;
          font-size: 1.2em;
        }

        input {
          height: 30px;
          border-radius: 5px;
          border: 1px solid #333333;
          width: 60px;
          font-size: 1.2em;
          padding: 5px 10px 5px 10px;
        }
      }

      #confirm-button {
        color: #ffffff;
        font-size: 1.2em;
        border-radius: 5px;
        border: none;
        height: 40px;
        aspect-ratio: 1;
        background-color: #44cc44;
        box-shadow: 1px 1px 2px 0px rgba(#000000,0.25);

        &:hover{
          background-color: #44dd44;
        }
      }
    }

    #aspect-ratio-list {
      margin: 10px 0px 0px 0px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .aspect-ratio-item {
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

        &:first-child {
          margin: 0px 10px 10px 0px;
        }

        &:last-child {
          margin: 0px 10px 20px 0px;
        }

        .aspect-ratio-item-icon {
          margin: 0px 0px 0px 20px;
          height: 30px;
          aspect-ratio: 1;
          color: #ffffff;
        }
      }

      .aspect-ratio-item-active {
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

        &:first-child {
          margin: 0px 10px 10px 0px;
        }

        &:last-child {
          margin: 0px 10px 20px 0px;
        }

        .aspect-ratio-item-icon {
          margin: 0px 0px 0px 20px;
          height: 30px;
          aspect-ratio: 1;
          color: #ffffff;
        }
      }
    }

    #import-json {
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
      width: 100%;
      box-shadow: 2px 2px 4px 0px rgba(#000000,0.25);

      &:hover{
        background-color: #ff3377;
      }

      #import-json-icon {
        height: 30px;
        aspect-ratio: 1;
        margin: 0px 20px 0px 0px;
      }
    }

    #json-error {
      text-align: left;
      font-size: 1.2em;
      color: #ff1133;
      padding: 5px 20px 5px 0px;
      margin: 20px 0px 0px 0px;
    }

    #json-container {
      display: none;
      margin: 20px 0px 0px 0px;
      width: 50%;
      aspect-ratio: 2;
    }

    .textarea_error {
      border: 1px solid #ff3355;
      color: #ff3355;

      &:focus-visible {
        border: 1px solid #ff3355;
        color: #ff3355;
      }
    }
  }

  .right-big {
    max-width: 30%;
  }

  .right-small {
    max-width: 30%;
  }
}

@media screen and (max-width: 1100px) {
  #container {
    margin: 40px 0px 20px 0px;
    align-items: center;

    #middle {
      margin: 20px 20px 0px 20px;
    }

    .middle-big {
      min-width: 80%;
    }

    .middle-small {
      min-width: 80%;
    }

    #right {
      margin: 20px 20px 0px 20px;
      align-items: center;

      #aspect-ratio-list {
        justify-content: center;
      }
    }

    .right-big {
      min-width: 80%;
    }

    .right-small {
      min-width: 80%;
    }
  }
}
</style>
