import os
from PIL import Image

images_to_convert = [
    "main.jpg",
    "landscape-design.jpg",
    "garden-maintenance.jpg",
    "hardscaping.jpg",
    "outdoor-lighting.jpg",
    "treetriming.jpg",
    "irrigation-systems.png",
    "IMG_3535.jpg",
    "gallery-gazebo.png",
    "gallery-mulch.png",
    "gallery-main-repeating.jpg",
    "footer-background-pool.jpg",
    "logo.png",
    "logo-tropical.png",
    "logo-premium.png",
]


def convert_to_webp(source_file):
    if not os.path.exists(source_file):
        print(f"File not found: {source_file}")
        return

    filename, ext = os.path.splitext(source_file)
    output_file = f"{filename}.webp"

    try:
        with Image.open(source_file) as img:
            # Convert to RGB if necessary (e.g. for some PNGs or CMYK JPEGs)
            # but keep RGBA for transparency if it's there
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")

            img.save(output_file, "WEBP", quality=80, method=6)
            print(f"Converted {source_file} to {output_file}")
    except Exception as e:
        print(f"Error converting {source_file}: {e}")


if __name__ == "__main__":
    for img in images_to_convert:
        convert_to_webp(img)
