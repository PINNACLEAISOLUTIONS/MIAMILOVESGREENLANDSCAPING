import cv2
import numpy as np
import os
from tqdm import tqdm


def enhance_video(
    input_path,
    output_path,
    scale_factor=2.0,
    sharpness=1.5,
    brightness=1.1,
    contrast=1.2,
):
    """
    Enhance video quality using OpenCV

    Parameters:
    - input_path: Path to the input video
    - output_path: Path to save the enhanced video
    - scale_factor: Factor to upscale the video (default: 2.0)
    - sharpness: Sharpness enhancement factor (default: 1.5)
    - brightness: Brightness adjustment factor (default: 1.1)
    - contrast: Contrast adjustment factor (default: 1.2)
    """
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found.")
        return False

    # Open the video file
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file '{input_path}'.")
        return False

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Calculate new dimensions
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)

    # Create VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # Use 'mp4v' codec for MP4
    out = cv2.VideoWriter(output_path, fourcc, fps, (new_width, new_height))

    # Sharpening kernel
    kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]]) / sharpness

    print(f"Enhancing video: {input_path}")
    print(f"Original dimensions: {width}x{height}")
    print(f"Enhanced dimensions: {new_width}x{new_height}")
    print(f"Total frames: {total_frames}")

    # Process each frame
    with tqdm(total=total_frames, desc="Processing frames") as pbar:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Resize frame
            resized_frame = cv2.resize(
                frame, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4
            )

            # Apply sharpening
            sharpened = cv2.filter2D(resized_frame, -1, kernel)

            # Adjust brightness and contrast
            adjusted = cv2.convertScaleAbs(
                sharpened, alpha=contrast, beta=(brightness - 1.0) * 100
            )

            # Write the frame
            out.write(adjusted)

            pbar.update(1)

    # Release resources
    cap.release()
    out.release()

    print(f"Enhanced video saved to: {output_path}")
    return True


def apply_super_resolution(frame, scale_factor=2):
    """Apply a more advanced super-resolution technique to a frame"""
    # Convert to YCrCb color space (better for image processing)
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)

    # Extract Y channel (luminance)
    y, cr, cb = cv2.split(ycrcb)

    # Apply bilateral filter to preserve edges while reducing noise
    y_filtered = cv2.bilateralFilter(y, 5, 50, 50)

    # Upscale using Lanczos4 (high quality)
    height, width = y_filtered.shape
    y_upscaled = cv2.resize(
        y_filtered,
        (int(width * scale_factor), int(height * scale_factor)),
        interpolation=cv2.INTER_LANCZOS4,
    )

    # Apply unsharp mask for sharpening
    gaussian = cv2.GaussianBlur(y_upscaled, (0, 0), 3.0)
    y_sharpened = cv2.addWeighted(y_upscaled, 1.5, gaussian, -0.5, 0)

    # Upscale chroma channels
    cr_upscaled = cv2.resize(
        cr,
        (int(width * scale_factor), int(height * scale_factor)),
        interpolation=cv2.INTER_LANCZOS4,
    )
    cb_upscaled = cv2.resize(
        cb,
        (int(width * scale_factor), int(height * scale_factor)),
        interpolation=cv2.INTER_LANCZOS4,
    )

    # Merge channels back
    ycrcb_upscaled = cv2.merge([y_sharpened, cr_upscaled, cb_upscaled])

    # Convert back to BGR
    result = cv2.cvtColor(ycrcb_upscaled, cv2.COLOR_YCrCb2BGR)

    # Apply additional enhancements
    # Increase saturation
    hsv = cv2.cvtColor(result, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    s = cv2.multiply(s, 1.3)  # Increase saturation by 30%
    hsv_enhanced = cv2.merge([h, s, v])
    result = cv2.cvtColor(hsv_enhanced, cv2.COLOR_HSV2BGR)

    return result


def enhance_video_high_quality(input_path, output_path, scale_factor=2.0):
    """
    Enhanced version with more advanced techniques for higher quality
    """
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found.")
        return False

    # Open the video file
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file '{input_path}'.")
        return False

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Calculate new dimensions
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)

    # Create VideoWriter object with higher bitrate
    fourcc = cv2.VideoWriter_fourcc(*"H264")  # Use H264 for better quality
    out = cv2.VideoWriter(output_path, fourcc, fps, (new_width, new_height))

    if not out.isOpened():
        # Fallback to MP4V if H264 is not available
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, fps, (new_width, new_height))

    print(f"Enhancing video: {input_path}")
    print(f"Original dimensions: {width}x{height}")
    print(f"Enhanced dimensions: {new_width}x{new_height}")
    print(f"Total frames: {total_frames}")

    # Process each frame
    with tqdm(total=total_frames, desc="Processing frames") as pbar:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Apply super-resolution to the frame
            enhanced_frame = apply_super_resolution(frame, scale_factor)

            # Write the frame
            out.write(enhanced_frame)

            frame_count += 1
            pbar.update(1)

            # Process every 10th frame for preview
            if frame_count % 10 == 0:
                preview_path = f"./preview_frame_{frame_count}.jpg"
                cv2.imwrite(preview_path, enhanced_frame)
                print(f"Saved preview frame: {preview_path}")

    # Release resources
    cap.release()
    out.release()

    print(f"Enhanced video saved to: {output_path}")
    return True


if __name__ == "__main__":
    input_video = "./Untitled (Facebook Post).mp4"
    output_video = "./Untitled (Facebook Post)_enhanced.mp4"

    # Use the high quality enhancement function
    enhance_video_high_quality(
        input_video,
        output_video,
        scale_factor=2.0,  # Double the resolution
    )
