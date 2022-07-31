function cursor_is_not_at_screen_origin(cursor_position) {
  const page_x = cursor_position.x;
  const page_y = cursor_position.y;
  const viewport = { x: null, y: null };
  viewport.x = Math.trunc(window.scrollX);
  viewport.y = Math.trunc(window.scrollY);
  return page_x != viewport.x || page_y != viewport.y;
}

function hide_ghost(event) {
  const container = document.createElement("div");
  event.dataTransfer.setDragImage(container, 0, 0);
}

function container() {
  return document.querySelector("#crop-container");
}

function crop_area() {
  return document.querySelector("#crop-area");
}

function container_is_present(){
  return container() != null
}

function crop_area_is_present(){
  return crop_area() != null
}

function is_image_position_in_pixels() {
  const container_computed_style = getComputedStyle(container());
  const position = container_computed_style.backgroundPosition.split("px");
  return position.length > 1;
}

function is_image_size_in_pixels() {
  const container_computed_style = getComputedStyle(container());
  const size = container_computed_style.backgroundSize.split("px");
  return size.length > 1;
}

function is_image_ready(){
  return is_image_size_in_pixels() && is_image_position_in_pixels()
}

export {
  cursor_is_not_at_screen_origin,
  hide_ghost,
  container,
  crop_area,
  container_is_present,
  crop_area_is_present,
  is_image_ready
};
