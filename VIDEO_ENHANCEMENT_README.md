# Video Enhancement Instructions

This document explains how to enhance the video quality for the website.

## Prerequisites

- Python 3.6 or higher
- pip (Python package installer)

## Steps to Enhance the Video

1. **Run the Enhancement Script**
   - Double-click on the `enhance_video.bat` file
   - This will install the required Python packages and run the enhancement script
   - The process may take several minutes depending on your computer's performance

2. **The Enhanced Video**
   - After the script completes, a new file named `Untitled (Facebook Post)_enhanced.mp4` will be created
   - The HTML has already been updated to use this enhanced video

3. **Adjusting Enhancement Parameters**
   - If you want to adjust the enhancement parameters, open the `enhance_video.py` file in a text editor
   - You can modify these parameters at the bottom of the file:
     - `scale_factor`: How much to upscale the video (e.g., 1.5 = 50% larger)
     - `sharpness`: How much to sharpen the video (higher = sharper)
     - `brightness`: Brightness adjustment (1.0 = no change, >1.0 = brighter)
     - `contrast`: Contrast adjustment (1.0 = no change, >1.0 = more contrast)

## Troubleshooting

- If you encounter errors about missing packages, run:
  ```
  pip install opencv-python numpy tqdm
  ```

- If the video appears too large or too small, adjust the `scale_factor` parameter

- If the video appears too bright or too dark, adjust the `brightness` parameter

- If the video lacks detail, increase the `sharpness` parameter

## Browser-side Enhancements

The website already includes CSS enhancements to improve video display quality in the browser:

- Slight brightness, contrast, and saturation adjustments
- Hardware acceleration for smoother playback
- Image rendering optimizations for different browsers

These CSS enhancements work alongside the Python-enhanced video for the best possible quality.