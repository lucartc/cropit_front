import { convert_background_image_dimensions_to_pixels } from "./background_image_dimensions.js";

import { ref } from "vue";

import { cursor_is_not_at_screen_origin, hide_ghost } from "./general.js";

const initial_position = ref(null);
const background_container = ref(null);

function background_drag(event) {
  const container_computed_style = getComputedStyle(background_container.value);
  const cursor_position = {
    x: event.pageX,
    y: event.pageY,
  };

  if (initial_position.value != null) {
    move_background_image(cursor_position);
  } else {
    const background_image = new Image();
    background_image.src = container_computed_style.backgroundImage
      .replace('url("', "")
      .replace('")', "");

    background_image.addEventListener("load", (event) => {
      convert_background_image_dimensions_to_pixels(
        event.target,
        background_container.value
      );
    });

    const container_box = background_container.value.getBoundingClientRect();

    initial_position.value = {
      x: cursor_position.x - container_box.left,
      y: cursor_position.y - container_box.top,
    };
  }
}

function move_background_image(cursor_position) {
  if (cursor_is_not_at_screen_origin(cursor_position)) {
    const container_computed_style = getComputedStyle(
      background_container.value
    );
    const container_box = background_container.value.getBoundingClientRect();
    const style = background_container.value.style;
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

function start_background_dragging(event, container) {
  background_container.value = container;
  hide_ghost(event);
}

function finish_background_dragging() {
  initial_position.value = null;
}

export {
  background_drag,
  start_background_dragging,
  finish_background_dragging,
};
