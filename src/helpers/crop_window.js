import { ref, nextTick } from "vue";

import {
  cursor_is_not_at_screen_origin,
  hide_ghost,
  container,
  crop_area,
  opacity_top,
  opacity_right,
  opacity_bottom,
  opacity_left,
  container_is_present,
  crop_area_is_present
} from "./general.js";

const last_cursor_position = ref(null);
const current_cursor_position = ref(null);
const drag_started = ref(false);
const drag_finished = ref(false);

function crop_container() {
  return container();
}

function update_crop_position(event) {
  event.stopPropagation();
  if(container_is_present() && crop_area_is_present()){
    set_current_cursor_position(event);
    calculate_x_position();
    calculate_y_position();
    calculate_opacity_position();
  }
}

function set_current_cursor_position(event) {
  event.stopPropagation();
  current_cursor_position.value = { x: event.pageX, y: event.pageY };
}

function calculate_x_position() {
  const container_box = crop_container().getBoundingClientRect();
  const crop = crop_area();
  let page_x = current_cursor_position.value.x;
  let crop_box = crop.getBoundingClientRect();
  const left = crop_box.left - container_box.left;

  if (cursor_is_not_at_screen_origin(current_cursor_position.value)) {
    if (!drag_is_happening()) {
      page_x = last_cursor_position.value.x;
    }

    if (crop_should_move_x()) {
      crop.style.left =
        (left + page_x - last_cursor_position.value.x).toString() + "px";
    }

    crop_box = crop.getBoundingClientRect();

    if (crop_box.left < container_box.left) {
      crop.style.left = 0;
    }

    crop_box = crop.getBoundingClientRect();

    if (crop_box.right > container_box.right) {
      crop.style.left =
        (container_box.width - crop_box.width).toString() + "px";
    }

    last_cursor_position.value.x = page_x;
  }
}

function crop_should_move_x() {
  return !crop_should_not_move_x();
}

function crop_should_not_move_x() {
  const x_coordinate = current_cursor_position.value.x;
  const page_x = drag_is_happening()
    ? x_coordinate
    : last_cursor_position.value.x;
  const displacement = page_x - last_cursor_position.value.x;
  let should_not_move_to_right = null;
  let should_not_move_to_left = null;

  should_not_move_to_right = displacement > 0 && cursor_off_limits_left();
  should_not_move_to_left = displacement < 0 && cursor_off_limits_right();

  return should_not_move_to_right || should_not_move_to_left;
}

function cursor_off_limits_left() {
  const container_box = crop_container().getBoundingClientRect();
  const x_coordinate = current_cursor_position.value.x;
  const page_x = drag_is_happening()
    ? x_coordinate
    : last_cursor_position.value.x;
  return page_x < container_box.left + window.scrollX;
}

function cursor_off_limits_right() {
  const container_box = crop_container().getBoundingClientRect();
  const x_coordinate = current_cursor_position.value.x;
  const page_x = drag_is_happening()
    ? x_coordinate
    : last_cursor_position.value.x;
  return page_x > container_box.right + window.scrollX;
}

function calculate_y_position() {
  const container_box = crop_container().getBoundingClientRect();
  const crop = crop_area();
  let page_y = current_cursor_position.value.y;
  let crop_box = crop.getBoundingClientRect();
  const top = crop_box.top - container_box.top;

  if (cursor_is_not_at_screen_origin(current_cursor_position.value)) {
    if (!drag_is_happening()) {
      page_y = last_cursor_position.value.y;
    }

    if (crop_should_move_y()) {
      crop.style.top =
        (top + page_y - last_cursor_position.value.y).toString() + "px";
    }

    crop_box = crop.getBoundingClientRect();

    if (crop_box.top < container_box.top) {
      crop.style.top = 0;
    }

    crop_box = crop.getBoundingClientRect();

    if (crop_box.bottom > container_box.bottom) {
      crop.style.top =
        (container_box.height - crop_box.height).toString() + "px";
    }

    last_cursor_position.value.y = page_y;
  }
}

function crop_should_move_y() {
  return !crop_should_not_move_y();
}

function crop_should_not_move_y() {
  const y_coordinate = current_cursor_position.value.y;
  const page_y = drag_is_happening()
    ? y_coordinate
    : last_cursor_position.value.y;
  const displacement = page_y - last_cursor_position.value.y;
  let should_not_move_to_top = null;
  let should_not_move_to_bottom = null;

  should_not_move_to_top = displacement < 0 && cursor_off_limits_bottom();
  should_not_move_to_bottom = displacement > 0 && cursor_off_limits_top();

  return should_not_move_to_top || should_not_move_to_bottom;
}

function cursor_off_limits_top() {
  const y_coordinate = current_cursor_position.value.y;
  const container_box = crop_container().getBoundingClientRect();
  const page_y = drag_is_happening()
    ? y_coordinate
    : last_cursor_position.value.y;
  return page_y < container_box.top + window.scrollY;
}

function cursor_off_limits_bottom() {
  const y_coordinate = current_cursor_position.value.y;
  const container_box = crop_container().getBoundingClientRect();
  const page_y = drag_is_happening()
    ? y_coordinate
    : last_cursor_position.value.y;
  return page_y > container_box.bottom + window.scrollY;
}

function drag_is_happening() {
  return drag_started.value && !drag_finished.value;
}

function calculate_opacity_position() {
  if(container_is_present() && crop_area_is_present()){
    calculate_opacity_top_position();
    calculate_opacity_right_position();
    calculate_opacity_bottom_position();
    calculate_opacity_left_position();
  }
}

function calculate_opacity_top_position() {
  const container_box = crop_container().getBoundingClientRect();
  const crop = crop_area();
  const crop_box = crop.getBoundingClientRect();
  const style = opacity_top().style;

  style.left = crop.style.left;
  style.width = Math.abs(container_box.right - crop_box.left).toString() + "px";
  style.height = Math.abs(crop_box.top - container_box.top).toString() + "px";
}

function calculate_opacity_right_position() {
  const container_box = crop_container().getBoundingClientRect();
  const crop = crop_area();
  const crop_box = crop.getBoundingClientRect();
  const style = opacity_right().style;

  style.top = crop.style.top;
  style.width =
    Math.abs(container_box.right - crop_box.right).toString() + "px";
  style.height =
    Math.abs(container_box.bottom - crop_box.top).toString() + "px";
}

function calculate_opacity_bottom_position() {
  const container_box = crop_container().getBoundingClientRect();
  const crop = crop_area();
  const crop_box = crop.getBoundingClientRect();
  const style = opacity_bottom().style;

  style.top = crop_box.bottom - container_box.top;
  style.width = Math.abs(crop_box.right - container_box.left).toString() + "px";
  style.height =
    Math.abs(container_box.bottom - crop_box.bottom).toString() + "px";
}

function calculate_opacity_left_position() {
  const container_box = crop_container().getBoundingClientRect();
  const crop = crop_area();
  const crop_box = crop.getBoundingClientRect();
  const style = opacity_left().style;

  style.left = container_box.left;
  style.width = Math.abs(crop_box.left - container_box.left).toString() + "px";
  style.height =
    Math.abs(crop_box.bottom - container_box.top).toString() + "px";
}

function finish_drag(event) {
  event.stopPropagation();
  drag_finished.value = true;
  update_crop_position(event);
  reset_positions();
}

function set_current_resizing_position() {
  const container_box = crop_container().getBoundingClientRect();

  current_cursor_position.value = {
    x: container_box.left,
    y: container_box.top,
  };

  last_cursor_position.value = {
    x: container_box.left,
    y: container_box.top,
  };
}

function reset_positions() {
  last_cursor_position.value = null;
  current_cursor_position.value = null;
}

function set_last_cursor_position(event) {
  event.stopPropagation();
  last_cursor_position.value = { x: event.pageX, y: event.pageY };
}

function add_resize_listener() {
  window.addEventListener("resize", adjust_component_size);
}

function remove_resize_listener() {
  window.addEventListener("resize", adjust_component_size);
}

function adjust_component_size() {
  nextTick(() => {
    setup_drag_flags();
    set_current_resizing_position();
    calculate_x_position();
    calculate_y_position();
    calculate_opacity_position();
  });
}

function crop_window_setup() {
  calculate_opacity_position();
  remove_resize_listener();
  add_resize_listener();
}

function crop_window_teardown() {
  remove_resize_listener();
}

function start_drag(event) {
  event.stopPropagation();
  hide_ghost(event);
  setup_drag_flags();
}

function setup_drag_flags() {
  drag_started.value = true;
  drag_finished.value = false;
}

export {
  set_last_cursor_position as set_cursor_position,
  start_drag,
  finish_drag,
  crop_window_setup,
  crop_window_teardown,
  update_crop_position,
};
