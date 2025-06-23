import cv2
import numpy as np
import os
from tqdm import tqdm

def enhance_video(input_path, output_path, scale_factor=2.0, sharpness=1.5, brightness=1.1, contrast=1.2):
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
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Use 'mp4v' codec for MP4
    out = cv2.VideoWriter(output_path, fourcc, fps, (new_width, new_height))
    
    # Sharpening kernel
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]]) / sharpness
    
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
            resized_frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
            
            # Apply sharpening
            sharpened = cv2.filter2D(resized_frame, -1, kernel)
            
            # Adjust brightness and contrast
            adjusted = cv2.convertScaleAbs(sharpened, alpha=contrast, beta=(brightness-1.0)*100)
            
            # Write the frame
            out.write(adjusted)
            
            pbar.update(1)
    
    # Release resources
    cap.release()
    out.release()
    
    print(f"Enhanced video saved to: {output_path}")
    return True

if __name__ == "__main__":
    input_video = "./Untitled (Facebook Post).mp4"
    output_video = "./Untitled (Facebook Post)_enhanced.mp4"
    
    # Enhance the video with custom parameters
    enhance_video(
        input_video, 
        output_video,
        scale_factor=1.5,  # Upscale by 50%
        sharpness=1.8,     # Increase sharpness
        brightness=1.15,   # Slightly increase brightness
        contrast=1.25      # Increase contrast
    )