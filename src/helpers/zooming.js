import {
  ref
} from "vue";

import {
  convert_background_image_dimensions_to_pixels,
  update_background_dimensions
} from "./background_image_dimensions.js";

const image_current_position = ref(null);
const image_current_size = ref(null);
const zoom_percentage = 5;
const zoom_container = ref(null);

function zoom(cursor_absolute_position, container, in_out) {
  const background_image = new Image();
  const container_computed_style = getComputedStyle(container);
  zoom_container.value = container;

  background_image.src = container_computed_style.backgroundImage
    .replace('url("', "")
    .replace('")', "");

  background_image.addEventListener("load", () => {
    if (image_current_size.value == null) {
      const dimensions = convert_background_image_dimensions_to_pixels(
        background_image,
        zoom_container.value
      );

      update_background_dimensions(dimensions,zoom_container.value)

      image_current_size.value = {
        x: dimensions.image_width,
        y: dimensions.image_height,
      };

      image_current_position.value = {
        x: dimensions.left,
        y: dimensions.top,
      };
    }
    calculate_zooming(cursor_absolute_position, in_out);
  });
}

function calculate_zooming(cursor_absolute_position, in_out) {
  let resized_dimensions = null;

  resized_dimensions = resize_dimensions(cursor_absolute_position, in_out);

  image_current_size.value = {
    x: resized_dimensions.image_width,
    y: resized_dimensions.image_height,
  };

  image_current_position.value = {
    x: resized_dimensions.left,
    y: resized_dimensions.top,
  };

  const style = zoom_container.value.style;
  const new_width = resized_dimensions.image_width;
  const new_height = resized_dimensions.image_height;
  const new_distance_top = resized_dimensions.top;
  const new_distance_left = resized_dimensions.left;
  style.backgroundSize = `${new_width}px ${new_height}px`;
  style.backgroundPosition = `${new_distance_left}px ${new_distance_top}px`;
}

function resize_dimensions(cursor_absolute_position, in_out) {
  const container_box = zoom_container.value.getBoundingClientRect();

  image_current_position.value = {
    x: parseFloat(
      zoom_container.value.style.backgroundPosition
        .split("px", 2)
        .shift()
        .trim()
    ),
    y: parseFloat(
      zoom_container.value.style.backgroundPosition.split("px", 2).pop().trim()
    ),
  };

  const dimensions = {
    image_width: image_current_size.value.x,
    image_height: image_current_size.value.y,
    top: image_current_position.value.y,
    left: image_current_position.value.x,
  };

  dimensions.image_width *= scaling_factor(in_out);
  dimensions.image_height *= scaling_factor(in_out);

  const image_center = {
    x: dimensions.left + dimensions.image_width / 2,
    y: dimensions.top + dimensions.image_height / 2,
  };

  const cursor_relative_position = {
    x: cursor_absolute_position.x - container_box.left,
    y: cursor_absolute_position.y - container_box.top,
  };

  const new_image_to_cursor_distance = {
    x: (image_center.x - cursor_relative_position.x) * scaling_factor(in_out),
    y: (image_center.y - cursor_relative_position.y) * scaling_factor(in_out),
  };

  const bottom =
    Math.abs(new_image_to_cursor_distance.y) -
    Math.abs(dimensions.image_height / 2) +
    Math.abs(container_box.bottom - cursor_absolute_position.y);
  const right =
    Math.abs(new_image_to_cursor_distance.x) -
    Math.abs(dimensions.image_width / 2) +
    Math.abs(container_box.right - cursor_absolute_position.x);

  if (image_is_above_left(new_image_to_cursor_distance)) {
    dimensions.top =
      Math.abs(container_box.height) -
      Math.abs(bottom) -
      Math.abs(dimensions.image_height);
    dimensions.left =
      Math.abs(container_box.width) -
      Math.abs(right) -
      Math.abs(dimensions.image_width);
  } else if (image_is_above_right(new_image_to_cursor_distance)) {
    dimensions.top =
      Math.abs(container_box.height) -
      Math.abs(bottom) -
      Math.abs(dimensions.image_height);
    dimensions.left =
      Math.abs(new_image_to_cursor_distance.x) -
      Math.abs(dimensions.image_width / 2) +
      Math.abs(cursor_relative_position.x);
  } else if (image_is_below_left(new_image_to_cursor_distance)) {
    dimensions.top =
      Math.abs(new_image_to_cursor_distance.y) -
      Math.abs(dimensions.image_height / 2) +
      Math.abs(cursor_relative_position.y);
    dimensions.left =
      Math.abs(container_box.width) -
      Math.abs(right) -
      Math.abs(dimensions.image_width);
  } else if (image_is_below_right(new_image_to_cursor_distance)) {
    dimensions.top =
      Math.abs(new_image_to_cursor_distance.y) -
      Math.abs(dimensions.image_height / 2) +
      Math.abs(cursor_relative_position.y);
    dimensions.left =
      Math.abs(new_image_to_cursor_distance.x) -
      Math.abs(dimensions.image_width / 2) +
      Math.abs(cursor_relative_position.x);
  }

  return dimensions;
}

function scaling_factor(in_out) {
  return in_out == "in"
    ? Math.sqrt(1 + zoom_percentage / 100)
    : 1 / Math.sqrt(1 + zoom_percentage / 100);
}

function image_is_above_left(distance) {
  return distance.x <= 0 && distance.y <= 0;
}

function image_is_above_right(distance) {
  return distance.x > 0 && distance.y <= 0;
}

function image_is_below_left(distance) {
  return distance.x <= 0 && distance.y > 0;
}

function image_is_below_right(distance) {
  return distance.x > 0 && distance.y > 0;
}

export { zoom };
