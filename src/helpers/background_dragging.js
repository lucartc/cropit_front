import { ref } from "vue";

import {
  cursor_is_not_at_screen_origin,
  hide_ghost,
  container,
  background_image_size_in_pixels,
  background_image_position_in_pixels,
} from "./general.js";

const initial_position = ref(null);

function background_container() {
  return container();
}

function background_drag(event) {
  const cursor_position = {
    x: event.pageX,
    y: event.pageY,
  };

  if (initial_position.value != null) {
    move_background_image(cursor_position);
  } else {
    const container_box = background_container().getBoundingClientRect();

    initial_position.value = {
      x: cursor_position.x - container_box.left,
      y: cursor_position.y - container_box.top,
    };
  }
}

function move_background_image(cursor_position) {
  if (
    cursor_is_not_at_screen_origin(cursor_position) &&
    background_image_position_in_pixels() &&
    background_image_size_in_pixels()
  ) {
    const container_computed_style = getComputedStyle(background_container());
    const container_box = background_container().getBoundingClientRect();
    const style = background_container().style;
    const position = {
      x: parseFloat(
        container_computed_style.backgroundPosition
          .split("px", 2)
          .shift()
          .trim()
      ),
      y: parseFloat(
        container_computed_style.backgroundPosition.split("px", 2).pop().trim()
      ),
    };

    const distance_x =
      cursor_position.x - container_box.left - initial_position.value.x;

    const distance_y =
      cursor_position.y - container_box.top - initial_position.value.y;

    const new_position_x = position.x + distance_x;
    const new_position_y = position.y + distance_y;

    style.backgroundPosition = `${new_position_x}px ${new_position_y}px`;

    initial_position.value = {
      x: cursor_position.x - container_box.left,
      y: cursor_position.y - container_box.top,
    };
  }
}

function center_background_image() {
  if (
    background_image_size_in_pixels() &&
    background_image_position_in_pixels()
  ) {
    const container_box = background_container().getBoundingClientRect();
    const container_style = getComputedStyle(background_container());
    const background_size = container_style.backgroundSize;

    const image_size = {
      width: parseFloat(background_size.split("px", 2).shift().trim()),
      height: parseFloat(background_size.split("px", 2).pop().trim()),
    };

    const left = (container_box.width - image_size.width) / 2;
    const top = (container_box.height - image_size.height) / 2;

    background_container().style.backgroundPosition = `${left}px ${top}px`;
  }
}

function start_background_dragging(event) {
  hide_ghost(event);
}

function finish_background_dragging() {
  initial_position.value = null;
}

export {
  background_drag,
  start_background_dragging,
  finish_background_dragging,
  center_background_image,
};
