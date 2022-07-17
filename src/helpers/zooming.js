import { ref } from "vue";

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
      convert_background_image_dimensions_to_pixels(background_image);
    }
    calculate_zooming(cursor_absolute_position, in_out);
  });
}

function convert_background_image_dimensions_to_pixels(background_image) {
  const container_computed_style = getComputedStyle(zoom_container.value);
  const background_size = container_computed_style.backgroundSize;
  let image_dimensions = null;

  switch (background_size) {
    case "contain":
      image_dimensions =
        calculate_containing_image_dimensions(background_image);
      break;
    case "cover":
      image_dimensions = calculate_covering_image_dimensions(background_image);
      break;
  }

  image_current_size.value = {
    x: image_dimensions.image_width,
    y: image_dimensions.image_height,
  };

  image_current_position.value = {
    x: image_dimensions.left,
    y: image_dimensions.top,
  };

  const style = zoom_container.value.style;
  const width = image_dimensions.image_width;
  const height = image_dimensions.image_height;
  const distance_top = image_dimensions.top;
  const distance_left = image_dimensions.left;
  style.backgroundSize = `${width}px ${height}px`;
  style.backgroundPosition = `${distance_left}px ${distance_top}px`;
}

function calculate_covering_image_dimensions(image) {
  const container_box = zoom_container.value.getBoundingClientRect();
  const container_area = container_box.width.container_box.height;
  const height_aligned_area =
    container_box.height ** 2 * image_aspect_ratio(image);
  let image_height = null;
  let image_width = null;

  if (height_aligned_area > container_area) {
    image_height = container_box.height;
    image_width = container_box.height * image_aspect_ratio(image);
  } else {
    image_width = container_box.width;
    image_height = container_box.width * (1 / image_aspect_ratio(image));
  }

  const top = Math.abs(image_height - container_box.height) / 2;
  const left = Math.abs(image_width - container_box.width) / 2;

  return {
    image_height: image_height,
    image_width: image_width,
    top: top,
    left: left,
  };
}

function calculate_containing_image_dimensions(image) {
  const container_box = zoom_container.value.getBoundingClientRect();
  const container_computed_style = getComputedStyle(zoom_container.value);
  const position = container_computed_style.backgroundPosition;
  const distance_x_percentage = parseFloat(position.split("%", 2).shift());
  const distance_y_percentage = parseFloat(position.split("%", 2).pop().trim());
  let image_width = null;
  let image_height = null;
  const distance_x_pixels = (container_box.width * distance_x_percentage) / 100;
  const distance_y_pixels =
    (container_box.height * distance_y_percentage) / 100;

  if (image.naturalWidth > image.naturalHeight) {
    image_width = container_box.width;
    image_height = image_width * (1 / image_aspect_ratio(image));
  } else {
    image_height = container_box.height;
    image_width = image_height * image_aspect_ratio(image);
  }

  const top = distance_y_pixels - image_height / 2;
  const left = distance_x_pixels - image_width / 2;

  return {
    image_height: image_height,
    image_width: image_width,
    top: top,
    left: left,
  };
}

function image_aspect_ratio(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return parseFloat(width) / parseFloat(height);
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
