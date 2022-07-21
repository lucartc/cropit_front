import { container } from "./general.js";

function convert_background_image_dimensions_to_pixels() {
  const container_computed_style = getComputedStyle(container());
  const background_size = container_computed_style.backgroundSize;

  switch (background_size) {
    case "contain":
      convert_containing_image_dimensions_to_pixels();
      break;
    case "cover":
      convert_covering_image_dimensions_to_pixels();
      break;
  }
}

function convert_covering_image_dimensions_to_pixels() {
  const image = new Image();
  const container_box = container().getBoundingClientRect();
  const container_computed_style = getComputedStyle(container());

  image.src = container_computed_style.backgroundImage
    .replace('url("', "")
    .replace('")', "");

  image.addEventListener("load", () => {
    const container_area = container_box.width * container_box.height;
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

    container().style.backgroundSize = `${image_width}px ${image_height}px`;
    container().style.backgroundPosition = `${left}px ${top}px`;
  });
}

function convert_containing_image_dimensions_to_pixels() {
  const image = new Image();
  const container_box = container().getBoundingClientRect();
  const container_computed_style = getComputedStyle(container());

  image.src = container_computed_style.backgroundImage
    .replace('url("', "")
    .replace('")', "");

  image.addEventListener("load", () => {
    const container_area = container_box.width * container_box.height;
    const height_aligned_area =
      container_box.height ** 2 * image_aspect_ratio(image);
    let image_height = null;
    let image_width = null;

    if (height_aligned_area < container_area) {
      image_height = container_box.height;
      image_width = container_box.height * image_aspect_ratio(image);
    } else {
      image_width = container_box.width;
      image_height = container_box.width * (1 / image_aspect_ratio(image));
    }

    const top = Math.abs(image_height - container_box.height) / 2;
    const left = Math.abs(image_width - container_box.width) / 2;

    container().style.backgroundSize = `${image_width}px ${image_height}px`;
    container().style.backgroundPosition = `${left}px ${top}px`;
  });
}

function image_aspect_ratio(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  return parseFloat(width) / parseFloat(height);
}

export { convert_background_image_dimensions_to_pixels };
