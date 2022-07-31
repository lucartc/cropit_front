import { ref } from "vue";

import {
  cursor_is_not_at_screen_origin,
  hide_ghost,
  container,
  is_image_ready
} from "./general.js";

const initial_position = ref(null);

function image_container() {
  return container();
}

function image_drag(event) {
  const cursor_position = {
    x: event.pageX,
    y: event.pageY,
  };

  if (initial_position.value != null) {
    move_image(cursor_position);
  } else {
    const container_box = image_container().getBoundingClientRect();

    initial_position.value = {
      x: cursor_position.x - container_box.left,
      y: cursor_position.y - container_box.top,
    };
  }
}

function move_image(cursor_position) {
  if (
    cursor_is_not_at_screen_origin(cursor_position) &&
    is_image_ready()
  ) {
    const container_computed_style = getComputedStyle(image_container());
    const container_box = image_container().getBoundingClientRect();
    const style = image_container().style;
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

function center_image() {
  if (
    is_image_ready()
  ) {
    const container_box = image_container().getBoundingClientRect();
    const container_style = getComputedStyle(image_container());
    const background_size = container_style.backgroundSize;

    const image_size = {
      width: parseFloat(background_size.split("px", 2).shift().trim()),
      height: parseFloat(background_size.split("px", 2).pop().trim()),
    };

    const left = (container_box.width - image_size.width) / 2;
    const top = (container_box.height - image_size.height) / 2;

    image_container().style.backgroundPosition = `${left}px ${top}px`;
  }
}

function start_image_dragging(event) {
  hide_ghost(event);
}

function finish_image_dragging() {
  initial_position.value = null;
}

export {
  image_drag,
  start_image_dragging,
  finish_image_dragging,
  center_image
};
